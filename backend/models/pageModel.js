import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// ==========================================
// 1. MONGOOSE SCHEMA & MODEL SETUP
// ==========================================
const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a page title'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please add a page slug'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    layout: {
      type: Array,
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongoosePage = mongoose.model('Page', pageSchema);

// ==========================================
// 2. MOCK JSON DATABASE SETUP
// ==========================================
const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'pages.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Pre-seed mock pages if they don't exist
const seedDefaultPages = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultPages = [
      {
        _id: 'page_home_123',
        title: 'Home Page',
        slug: 'home',
        layout: [
          {
            id: 'block_h1',
            type: 'heading',
            text: 'Welcome to our platform!',
            fontSize: '48px',
            color: '#cbd5e1',
            align: 'center',
          },
          {
            id: 'block_p1',
            type: 'paragraph',
            text: 'This is a beautiful page designed using the Drag and Drop Page Builder.',
            fontSize: '18px',
            color: '#94a3b8',
            align: 'center',
          },
          {
            id: 'block_div1',
            type: 'divider',
            color: '#4f46e5',
            height: '4px',
          },
          {
            id: 'block_btn1',
            type: 'button',
            text: 'Explore Blog Feed',
            url: '/blogs',
            backgroundColor: '#4f46e5',
            textColor: '#ffffff',
            borderRadius: '12px',
          }
        ],
        author: 'mock_author_123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultPages, null, 2));
  }
};

const loadMockPages = () => {
  seedDefaultPages();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveMockPages = (pages) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(pages, null, 2));
};

class MockQuery {
  constructor(dataPromise) {
    this.dataPromise = dataPromise;
  }

  sort(options) {
    const sortedPromise = this.dataPromise.then((data) => {
      if (!Array.isArray(data)) return data;
      if (options && options.createdAt) {
        const order = options.createdAt === -1 ? -1 : 1;
        return [...data].sort((a, b) => {
          return order * (new Date(a.createdAt) - new Date(b.createdAt));
        });
      }
      return data;
    });
    return new MockQuery(sortedPromise);
  }

  then(onFulfilled, onRejected) {
    return this.dataPromise.then(onFulfilled, onRejected);
  }
}

// ==========================================
// 3. DYNAMIC WRAPPER INTERFACE (PROXY)
// ==========================================
class PageWrapper {
  static find(query = {}) {
    if (global.useMockDb) {
      const pagesPromise = (async () => {
        let pages = loadMockPages();
        Object.keys(query).forEach((key) => {
          const val = query[key];
          pages = pages.filter((p) => p[key] !== undefined && p[key].toString() === val.toString());
        });
        return pages;
      })();
      return new MockQuery(pagesPromise);
    } else {
      return MongoosePage.find(query);
    }
  }

  static findOne(query = {}) {
    if (global.useMockDb) {
      const pagePromise = (async () => {
        const pages = loadMockPages();
        const found = pages.find((p) => {
          return Object.keys(query).every((key) => p[key] !== undefined && p[key].toString() === query[key].toString());
        });
        return found || null;
      })();
      return new MockQuery(pagePromise);
    } else {
      return MongoosePage.findOne(query);
    }
  }

  static findById(id) {
    if (global.useMockDb) {
      const pagePromise = (async () => {
        const pages = loadMockPages();
        const found = pages.find((p) => p._id === id.toString());
        return found || null;
      })();
      return new MockQuery(pagePromise);
    } else {
      return MongoosePage.findById(id);
    }
  }

  static async create(pageData) {
    if (global.useMockDb) {
      const pages = loadMockPages();
      const slugExists = pages.some((p) => p.slug === pageData.slug);
      if (slugExists) {
        throw new Error('A page with this slug already exists');
      }

      const newPage = {
        _id: 'page_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        title: pageData.title,
        slug: pageData.slug,
        layout: pageData.layout || [],
        author: pageData.author,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      pages.push(newPage);
      saveMockPages(pages);
      return newPage;
    } else {
      return await MongoosePage.create(pageData);
    }
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    if (global.useMockDb) {
      const pages = loadMockPages();
      const index = pages.findIndex((p) => p._id === id.toString());
      if (index === -1) return null;

      if (updateData.slug && updateData.slug !== pages[index].slug) {
        const slugExists = pages.some((p) => p.slug === updateData.slug && p._id !== id.toString());
        if (slugExists) {
          throw new Error('A page with this slug already exists');
        }
      }

      const updatedPage = {
        ...pages[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      pages[index] = updatedPage;
      saveMockPages(pages);
      return updatedPage;
    } else {
      return await MongoosePage.findByIdAndUpdate(id, updateData, options);
    }
  }

  static async findByIdAndDelete(id) {
    if (global.useMockDb) {
      const pages = loadMockPages();
      const index = pages.findIndex((p) => p._id === id.toString());
      if (index === -1) return null;

      const deletedPage = pages.splice(index, 1)[0];
      saveMockPages(pages);
      return deletedPage;
    } else {
      return await MongoosePage.findByIdAndDelete(id);
    }
  }

  static async countDocuments(query = {}) {
    if (global.useMockDb) {
      return loadMockPages().length;
    } else {
      return await MongoosePage.countDocuments(query);
    }
  }
}

export default PageWrapper;
export { MongoosePage };
