import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// ==========================================
// 1. MONGOOSE SCHEMA & MODEL SETUP
// ==========================================
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Please add an excerpt'],
    },
    content: {
      type: String,
      required: [true, 'Please add content'],
    },
    featuredImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

const MongooseBlog = mongoose.model('Blog', blogSchema);


// ==========================================
// 2. MOCK JSON DATABASE SETUP
// ==========================================
const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'blogs.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure database folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to load users from userModel's fallback DB
const loadMockUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to read users database:', error);
  }
  return [];
};

// Pre-seed default blogs for a fresh installation
const seedDefaultBlogs = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultBlogs = [
      {
        _id: 'b1c83x9mrnnapke20240716',
        title: 'Welcome to BlogCMS!',
        slug: 'welcome-to-blogcms',
        excerpt: 'Discover the features of this modern, production-ready Content Management System setup.',
        content: '<h2>A Premium Experience</h2><p>Welcome to <strong>BlogCMS</strong>! This application features JWT authentication, local file upload capabilities, rich text editing with Quill, responsive layouts, and modern visual indicators.</p><p>You can create, edit, delete and publish blog posts. Give it a try by logging into your admin panel!</p>',
        featuredImage: '',
        category: 'General',
        tags: ['welcome', 'guide', 'cms'],
        status: 'Published',
        author: '6696b9b3e100f28e2025170d', // references the seeded admin user
        views: 24,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }

    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultBlogs, null, 2));
  }
};

const loadMockBlogs = () => {
  seedDefaultBlogs();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveMockBlogs = (blogs) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(blogs, null, 2));
};

// Mock Query Class to emulate Mongoose method chaining
class MockBlogQuery {
  constructor(dataPromise) {
    this.dataPromise = dataPromise;
  }

  sort(options) {
    const sortedPromise = this.dataPromise.then((data) => {
      if (!Array.isArray(data)) return data;
      // Sort by createdAt (-1 desc, 1 asc)
      if (options && options.createdAt) {
        const order = options.createdAt === -1 ? -1 : 1;
        return [...data].sort((a, b) => {
          return order * (new Date(a.createdAt) - new Date(b.createdAt));
        });
      }
      return data;
    });
    return new MockBlogQuery(sortedPromise);
  }

  async populate(field, fieldsToSelect) {
    const data = await this.dataPromise;
    if (!data) return null;

    const isArray = Array.isArray(data);
    const items = isArray ? data : [data];

    if (field === 'author') {
      const users = loadMockUsers();
      items.forEach((item) => {
        // Support both string IDs and Mongoose ObjectId formats
        const authorIdStr = item.author.toString();
        const authorUser = users.find((u) => u._id === authorIdStr);

        if (authorUser) {
          const populatedAuthor = {};
          if (fieldsToSelect) {
            const selectList = fieldsToSelect.split(' ');
            selectList.forEach((f) => {
              populatedAuthor[f] = authorUser[f];
            });
          } else {
            const { password, ...rest } = authorUser;
            Object.assign(populatedAuthor, rest);
          }
          item.author = populatedAuthor;
        } else {
          // Fallback placeholder if author is missing
          item.author = { name: 'Unknown Author', email: '', profileImage: '' };
        }
      });
    }

    return isArray ? items : items[0];
  }

  skip(n) {
    const skippedPromise = this.dataPromise.then((data) => {
      if (!Array.isArray(data)) return data;
      return data.slice(n);
    });
    return new MockBlogQuery(skippedPromise);
  }

  limit(n) {
    const limitedPromise = this.dataPromise.then((data) => {
      if (!Array.isArray(data)) return data;
      return data.slice(0, n);
    });
    return new MockBlogQuery(limitedPromise);
  }

  then(onFulfilled, onRejected) {
    return this.dataPromise.then(onFulfilled, onRejected);
  }
}



// ==========================================
// 3. DYNAMIC WRAPPER INTERFACE (PROXY)
// ==========================================
class BlogWrapper {
  static find(query = {}) {
    if (global.useMockDb) {
      const blogsPromise = (async () => {
        let blogs = loadMockBlogs();
        // Simple query filtering (e.g. { status: 'Published' } or { author: userId })
        Object.keys(query).forEach((key) => {
          const val = query[key];
          blogs = blogs.filter((b) => {
            if (b[key] === undefined) return false;
            return b[key].toString() === val.toString();
          });
        });
        return blogs;
      })();
      return new MockBlogQuery(blogsPromise);
    } else {
      return MongooseBlog.find(query);
    }
  }

  static findOne(query = {}) {
    if (global.useMockDb) {
      const blogPromise = (async () => {
        const blogs = loadMockBlogs();
        const found = blogs.find((b) => {
          return Object.keys(query).every((key) => {
            return b[key] !== undefined && b[key].toString() === query[key].toString();
          });
        });
        return found || null;
      })();
      return new MockBlogQuery(blogPromise);
    } else {
      return MongooseBlog.findOne(query);
    }
  }

  static findById(id) {
    if (global.useMockDb) {
      const blogPromise = (async () => {
        const blogs = loadMockBlogs();
        const found = blogs.find((b) => b._id === id.toString());
        return found || null;
      })();
      return new MockBlogQuery(blogPromise);
    } else {
      return MongooseBlog.findById(id);
    }
  }

  static async create(blogData) {
    if (global.useMockDb) {
      const blogs = loadMockBlogs();

      // Check unique slug
      const slugExists = blogs.some((b) => b.slug === blogData.slug);
      if (slugExists) {
        throw new Error('A blog with this slug or title already exists');
      }

      const newBlog = {
        _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        title: blogData.title,
        slug: blogData.slug,
        excerpt: blogData.excerpt,
        content: blogData.content,
        featuredImage: blogData.featuredImage || '',
        category: blogData.category,
        tags: blogData.tags || [],
        status: blogData.status || 'Draft',
        author: blogData.author.toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      blogs.push(newBlog);
      saveMockBlogs(blogs);
      return newBlog;
    } else {
      return await MongooseBlog.create(blogData);
    }
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    if (global.useMockDb) {
      const blogs = loadMockBlogs();
      const index = blogs.findIndex((b) => b._id === id.toString());
      if (index === -1) return null;

      const updatedBlog = {
        ...blogs[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      // Check slug uniqueness if it was modified
      if (updateData.slug && updateData.slug !== blogs[index].slug) {
        const slugExists = blogs.some((b) => b.slug === updateData.slug && b._id !== id.toString());
        if (slugExists) {
          throw new Error('A blog with this slug or title already exists');
        }
      }

      blogs[index] = updatedBlog;
      saveMockBlogs(blogs);
      return updatedBlog;
    } else {
      return await MongooseBlog.findByIdAndUpdate(id, updateData, options);
    }
  }

  static async findByIdAndDelete(id) {
    if (global.useMockDb) {
      const blogs = loadMockBlogs();
      const index = blogs.findIndex((b) => b._id === id.toString());
      if (index === -1) return null;

      const deletedBlog = blogs.splice(index, 1)[0];
      saveMockBlogs(blogs);
      return deletedBlog;
    } else {
      return await MongooseBlog.findByIdAndDelete(id);
    }
  }

  static async countDocuments(query = {}) {
    if (global.useMockDb) {
      return loadMockBlogs().length;
    } else {
      return await MongooseBlog.countDocuments(query);
    }
  }
}


export default BlogWrapper;
export { MongooseBlog };
