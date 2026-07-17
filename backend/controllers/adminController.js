import User from '../models/userModel.js';
import Blog from '../models/blogModel.js';
import Comment from '../models/commentModel.js';
import Page from '../models/pageModel.js';
import Category from '../models/categoryModel.js';
import fs from 'fs';
import path from 'path';

// Helper to load files in mock mode
const loadMockFile = (filename) => {
  const file = path.resolve('data', filename);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return [];
};

// @desc    Get administrative statistics overview
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    if (global.useMockDb) {
      const users = loadMockFile('users.json');
      const blogs = loadMockFile('blogs.json');
      const pages = loadMockFile('pages.json');
      const comments = loadMockFile('comments.json');

      res.json({
        totalUsers: users.length,
        totalBlogs: blogs.length,
        publishedBlogs: blogs.filter(b => b.status === 'Published').length,
        draftBlogs: blogs.filter(b => b.status === 'Draft').length,
        totalPages: pages.length,
        totalComments: comments.length,
      });
    } else {
      const totalUsers = await User.countDocuments();
      const totalBlogs = await Blog.countDocuments();
      const publishedBlogs = await Blog.countDocuments({ status: 'Published' });
      const draftBlogs = await Blog.countDocuments({ status: 'Draft' });
      const totalPages = await Page.countDocuments();
      const totalComments = await Comment.countDocuments();

      res.json({
        totalUsers,
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalPages,
        totalComments,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics chart data and tables
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res, next) => {
  try {
    if (global.useMockDb) {
      const users = loadMockFile('users.json');
      const blogs = loadMockFile('blogs.json');
      const comments = loadMockFile('comments.json');
      const pages = loadMockFile('pages.json');

      // 1. Blogs created per month (past 6 months)
      const monthlyData = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Seed past 6 months with 0
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
        monthlyData[label] = 0;
      }

      blogs.forEach(b => {
        const createdDate = new Date(b.createdAt);
        const label = `${monthNames[createdDate.getMonth()]} ${createdDate.getFullYear().toString().substring(2)}`;
        if (monthlyData[label] !== undefined) {
          monthlyData[label]++;
        }
      });

      const blogsCreatedPerMonth = Object.keys(monthlyData).map(month => ({
        month,
        count: monthlyData[month]
      }));

      // 2. Most Viewed Blogs
      const mostViewedBlogs = [...blogs]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(b => ({
          _id: b._id,
          title: b.title,
          views: b.views || 0
        }));

      // 3. Most Commented Blogs
      const commentCounts = {};
      comments.forEach(c => {
        const blogId = c.blog.toString();
        commentCounts[blogId] = (commentCounts[blogId] || 0) + 1;
      });

      const mostCommentedBlogs = [...blogs]
        .map(b => ({
          _id: b._id,
          title: b.title,
          commentsCount: commentCounts[b._id.toString()] || 0
        }))
        .sort((a, b) => b.commentsCount - a.commentsCount)
        .slice(0, 5);

      // 4. Newest users
      const newestUsers = [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(u => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt
        }));

      // 5. Recent Activity logs
      const activities = [];
      
      blogs.slice(-5).forEach(b => {
        activities.push({
          type: 'blog',
          message: `Blog article "${b.title}" was created / updated`,
          time: b.updatedAt || b.createdAt
        });
      });

      comments.slice(-5).forEach(c => {
        activities.push({
          type: 'comment',
          message: `Comment was posted: "${c.content.substring(0, 30)}..."`,
          time: c.createdAt
        });
      });

      pages.slice(-5).forEach(p => {
        activities.push({
          type: 'page',
          message: `Page layout "${p.title}" was modified`,
          time: p.updatedAt || p.createdAt
        });
      });

      const recentActivity = activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);

      res.json({
        blogsCreatedPerMonth,
        mostViewedBlogs,
        mostCommentedBlogs,
        newestUsers,
        recentActivity
      });

    } else {
      // 1. Group blogs by month
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
        monthlyData[label] = 0;
      }

      const allBlogs = await Blog.find({});
      allBlogs.forEach(b => {
        const createdDate = new Date(b.createdAt);
        const label = `${monthNames[createdDate.getMonth()]} ${createdDate.getFullYear().toString().substring(2)}`;
        if (monthlyData[label] !== undefined) {
          monthlyData[label]++;
        }
      });

      const blogsCreatedPerMonth = Object.keys(monthlyData).map(month => ({
        month,
        count: monthlyData[month]
      }));

      // 2. Most Viewed Blogs
      const mostViewedBlogs = await Blog.find({ status: 'Published' })
        .sort({ views: -1 })
        .limit(5)
        .select('title views');

      // 3. Most Commented Blogs
      const commentsGroup = await Comment.aggregate([
        { $group: { _id: '$blog', commentsCount: { $sum: 1 } } },
        { $sort: { commentsCount: -1 } },
        { $limit: 5 }
      ]);
      
      const blogIds = commentsGroup.map(c => c._id);
      const matchedBlogs = await Blog.find({ _id: { $in: blogIds } }).select('title');
      
      const mostCommentedBlogs = commentsGroup.map(cg => {
        const blogObj = matchedBlogs.find(b => b._id.toString() === cg._id.toString());
        return {
          _id: cg._id,
          title: blogObj ? blogObj.title : 'Deleted Blog',
          commentsCount: cg.commentsCount
        };
      });

      // 4. Newest users
      const newestUsers = await User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt');

      // 5. Recent Activity
      const activities = [];
      const latestBlogs = await Blog.find({}).sort({ updatedAt: -1 }).limit(5);
      const latestComments = await Comment.find({}).sort({ createdAt: -1 }).limit(5);
      const latestPages = await Page.find({}).sort({ updatedAt: -1 }).limit(5);

      latestBlogs.forEach(b => {
        activities.push({
          type: 'blog',
          message: `Blog article "${b.title}" was created / updated`,
          time: b.updatedAt || b.createdAt
        });
      });

      latestComments.forEach(c => {
        activities.push({
          type: 'comment',
          message: `Comment was posted: "${c.content.substring(0, 30)}..."`,
          time: c.createdAt
        });
      });

      latestPages.forEach(p => {
        activities.push({
          type: 'page',
          message: `Page layout "${p.title}" was modified`,
          time: p.updatedAt || p.createdAt
        });
      });

      const recentActivity = activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);

      res.json({
        blogsCreatedPerMonth,
        mostViewedBlogs,
        mostCommentedBlogs,
        newestUsers,
        recentActivity
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot edit your own role');
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own admin account');
    }

    // Delete user's references (e.g. blogs, comments) optionally, or just delete user
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments (moderation)
// @route   GET /api/admin/comments
// @access  Private/Admin
export const getAllComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email profileImage')
      .populate('blog', 'title slug');

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any comment by admin
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
export const deleteCommentByAdmin = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all builder pages list
// @route   GET /api/admin/pages
// @access  Private/Admin
export const getAllPagesAdmin = async (req, res, next) => {
  try {
    if (global.useMockDb) {
      const pages = loadMockFile('pages.json');
      const users = loadMockFile('users.json');
      
      const populatedPages = pages.map(p => {
        const authorUser = users.find(u => u._id === p.author);
        return {
          ...p,
          author: authorUser ? { _id: authorUser._id, name: authorUser.name, email: authorUser.email } : null
        };
      });
      res.json(populatedPages);
    } else {
      const pages = await Page.find({})
        .sort({ createdAt: -1 })
        .populate('author', 'name email');
      res.json(pages);
    }
  } catch (error) {
    next(error);
  }
};

