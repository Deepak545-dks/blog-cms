import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Blog from '../models/blogModel.js';
import Category from '../models/categoryModel.js';
import Comment from '../models/commentModel.js';


// Helper to slugify text
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

// Helper to safely delete file from disk
const deleteFile = (filePath) => {
  if (!filePath) return;
  const __dirname = path.resolve();
  // Strip leading slash if present
  const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  const fullPath = path.join(__dirname, relativePath);
  
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.unlink(fullPath, (unlinkErr) => {
        if (unlinkErr) console.error(`Failed to delete file: ${fullPath}`, unlinkErr);
        else console.log(`Deleted file: ${fullPath}`);
      });
    }
  });
};

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, category, tags, status } = req.body;

    if (!title || !excerpt || !content || !category) {
      res.status(400);
      throw new Error('Please provide all required fields: title, excerpt, content, category');
    }

    // Generate slug
    const slug = slugify(title);

    // Parse tags if sent as comma-separated or JSON
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else {
        parsedTags = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
      }
    }

    // Set featured image if uploaded
    let featuredImage = '';
    if (req.file) {
      featuredImage = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags: parsedTags,
      status: status || 'Draft',
      author: req.user._id,
    });

    res.status(201).json(blog);
  } catch (error) {
    // Clean up uploaded file if DB operation failed
    if (req.file) {
      deleteFile(`/uploads/${req.file.filename}`);
    }
    next(error);
  }
};

// @desc    Get all blogs (Public feed of Published blogs or Private list of Author blogs)
// @route   GET /api/blogs
// @access  Public (for published feed) / Private (if checking my-blogs)
// Helper to load files in controller
const loadMockBlogs = () => {
  const file = path.resolve('data', 'blogs.json');
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return [];
};

const loadMockUsers = () => {
  const file = path.resolve('data', 'users.json');
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return [];
};

// @desc    Get all blogs (Public feed of Published blogs)
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, category, author, sort } = req.query;

    if (global.useMockDb) {
      let list = loadMockBlogs();

      // Public Feed: fetch only published posts
      list = list.filter((b) => b.status === 'Published');

      if (category && category !== 'All') {
        list = list.filter((b) => b.category.toLowerCase() === category.toLowerCase());
      }

      if (author) {
        list = list.filter((b) => b.author.toString() === author.toString());
      }

      if (search) {
        const queryStr = search.toLowerCase();
        list = list.filter((b) => {
          const titleMatch = b.title.toLowerCase().includes(queryStr);
          const contentMatch = b.content.toLowerCase().includes(queryStr);
          const categoryMatch = b.category.toLowerCase().includes(queryStr);
          const tagsMatch = b.tags && b.tags.some(t => t.toLowerCase().includes(queryStr));
          return titleMatch || contentMatch || categoryMatch || tagsMatch;
        });
      }

      // Sort
      const order = sort === 'oldest' ? 1 : -1;
      list = [...list].sort((a, b) => {
        return order * (new Date(a.createdAt) - new Date(b.createdAt));
      });

      const totalBlogs = list.length;
      const totalPages = Math.ceil(totalBlogs / limit);
      const paginatedList = list.slice(skip, skip + limit);

      // Populate author
      const users = loadMockUsers();
      paginatedList.forEach((b) => {
        const authorUser = users.find(u => u._id === b.author);
        if (authorUser) {
          b.author = { _id: authorUser._id, name: authorUser.name, email: authorUser.email, profileImage: authorUser.profileImage };
        }
      });

      return res.json({
        blogs: paginatedList,
        page,
        totalPages,
        totalBlogs,
      });
    } else {
      const query = { status: 'Published' };

      if (category && category !== 'All') {
        query.category = category;
      }

      if (author) {
        query.author = author;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      const sortOrder = sort === 'oldest' ? 1 : -1;

      const totalBlogs = await Blog.countDocuments(query);
      const totalPages = Math.ceil(totalBlogs / limit);

      const blogs = await Blog.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email profileImage');

      res.json({
        blogs,
        page,
        totalPages,
        totalBlogs,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's blogs (Dashboard management)
// @route   GET /api/blogs/my-blogs
// @access  Private
export const getMyBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, category, status, sort } = req.query;

    if (global.useMockDb) {
      let list = loadMockBlogs();

      // Only user's blogs
      list = list.filter((b) => b.author.toString() === req.user._id.toString());

      if (category && category !== 'All') {
        list = list.filter((b) => b.category.toLowerCase() === category.toLowerCase());
      }

      if (status && status !== 'All') {
        list = list.filter((b) => b.status === status);
      }

      if (search) {
        const queryStr = search.toLowerCase();
        list = list.filter((b) => {
          const titleMatch = b.title.toLowerCase().includes(queryStr);
          const contentMatch = b.content.toLowerCase().includes(queryStr);
          const categoryMatch = b.category.toLowerCase().includes(queryStr);
          const tagsMatch = b.tags && b.tags.some(t => t.toLowerCase().includes(queryStr));
          return titleMatch || contentMatch || categoryMatch || tagsMatch;
        });
      }

      // Sort
      const order = sort === 'oldest' ? 1 : -1;
      list = [...list].sort((a, b) => {
        return order * (new Date(a.createdAt) - new Date(b.createdAt));
      });

      const totalBlogs = list.length;
      const totalPages = Math.ceil(totalBlogs / limit);
      const paginatedList = list.slice(skip, skip + limit);

      // Populate author
      const users = loadMockUsers();
      paginatedList.forEach((b) => {
        const authorUser = users.find(u => u._id === b.author);
        if (authorUser) {
          b.author = { _id: authorUser._id, name: authorUser.name, email: authorUser.email, profileImage: authorUser.profileImage };
        }
      });

      return res.json({
        blogs: paginatedList,
        page,
        totalPages,
        totalBlogs,
      });
    } else {
      const query = { author: req.user._id };

      if (category && category !== 'All') {
        query.category = category;
      }

      if (status && status !== 'All') {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      const sortOrder = sort === 'oldest' ? 1 : -1;

      const totalBlogs = await Blog.countDocuments(query);
      const totalPages = Math.ceil(totalBlogs / limit);

      const blogs = await Blog.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email profileImage');

      res.json({
        blogs,
        page,
        totalPages,
        totalBlogs,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics / stats
// @route   GET /api/blogs/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (global.useMockDb) {
      const blogs = loadMockBlogs();
      const categoriesFile = path.resolve('data', 'categories.json');
      const commentsFile = path.resolve('data', 'comments.json');

      const categories = fs.existsSync(categoriesFile)
        ? JSON.parse(fs.readFileSync(categoriesFile, 'utf-8'))
        : [];
      const comments = fs.existsSync(commentsFile)
        ? JSON.parse(fs.readFileSync(commentsFile, 'utf-8'))
        : [];

      const userBlogs = blogs.filter((b) => b.author.toString() === userId.toString());
      const totalBlogs = userBlogs.length;
      const publishedBlogs = userBlogs.filter((b) => b.status === 'Published').length;
      const draftBlogs = userBlogs.filter((b) => b.status === 'Draft').length;
      
      const totalCategories = categories.length;

      // Count comments on the user's blogs
      const userBlogIds = userBlogs.map((b) => b._id.toString());
      const userBlogComments = comments.filter((c) => userBlogIds.includes(c.blog.toString()));
      const totalComments = userBlogComments.length;

      res.json({
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalCategories,
        totalComments,
      });
    } else {
      const userBlogsQuery = { author: userId };
      const totalBlogs = await Blog.countDocuments(userBlogsQuery);
      const publishedBlogs = await Blog.countDocuments({ ...userBlogsQuery, status: 'Published' });
      const draftBlogs = await Blog.countDocuments({ ...userBlogsQuery, status: 'Draft' });

      const totalCategories = await Category.countDocuments();

      const userBlogs = await Blog.find(userBlogsQuery).select('_id');
      const blogIds = userBlogs.map((b) => b._id);

      const totalComments = await Comment.countDocuments({ blog: { $in: blogIds } });

      res.json({
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalCategories,
        totalComments,
      });
    }
  } catch (error) {
    next(error);
  }
};


// @desc    Get single blog by slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'name email profileImage');

    if (!blog) {
      res.status(404);
      throw new Error('Blog post not found');
    }

    // Only allow viewing if post is Published or user is the Author
    if (blog.status !== 'Published') {
      // Decode token manually if present (optional auth for draft viewing)
      let activeUser = null;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
          activeUser = await User.findById(decoded.id);
        } catch (error) {
          // Ignore invalid token
        }
      }

      const isAuthor = activeUser && blog.author._id.toString() === activeUser._id.toString();
      const isAdmin = activeUser && activeUser.role === 'admin';
      
      if (!isAuthor && !isAdmin) {
        res.status(403);
        throw new Error('Access denied, draft posts can only be viewed by authors');
      }
    }

    // Increment views
    try {
      if (global.useMockDb) {
        const blogRaw = await Blog.findById(blog._id);
        if (blogRaw) {
          const updatedViews = (blogRaw.views || 0) + 1;
          await Blog.findByIdAndUpdate(blog._id, { views: updatedViews });
          blog.views = updatedViews;
        }
      } else {
        await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
        blog.views = (blog.views || 0) + 1;
      }
    } catch (viewError) {
      console.error('Failed to increment blog views:', viewError);
    }

    res.json(blog);

  } catch (error) {
    next(error);
  }
};


// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Private
export const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error('Blog post not found');
    }

    // Verify ownership or admin privileges
    const isAuthor = blog.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to access this blog');
    }

    res.json(blog);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, category, tags, status } = req.body;

    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error('Blog post not found');
    }

    // Verify ownership or admin privileges
    const isAuthor = blog.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to update this blog');
    }

    // Build update object
    const updateData = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = slugify(title);
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        updateData.tags = tags;
      } else {
        updateData.tags = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
      }
    }

    // Handle new featured image upload
    if (req.file) {
      updateData.featuredImage = `/uploads/${req.file.filename}`;
      // Clean up previous image if it exists
      if (blog.featuredImage) {
        deleteFile(blog.featuredImage);
      }
    }

    // Perform update
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updatedBlog);
  } catch (error) {
    if (req.file) {
      deleteFile(`/uploads/${req.file.filename}`);
    }
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error('Blog post not found');
    }

    // Verify ownership or admin privileges
    const isAuthor = blog.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this blog');
    }

    // Delete featured image file if present
    if (blog.featuredImage) {
      deleteFile(blog.featuredImage);
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    next(error);
  }
};
