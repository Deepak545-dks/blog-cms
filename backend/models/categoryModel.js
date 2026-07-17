import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// ==========================================
// 1. MONGOOSE SCHEMA & MODEL SETUP
// ==========================================
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseCategory = mongoose.model('Category', categorySchema);


// ==========================================
// 2. MOCK JSON DATABASE SETUP
// ==========================================
const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'categories.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Pre-seed default categories
const seedDefaultCategories = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultCategories = [
      {
        _id: 'cat_tech_123',
        name: 'Tech',
        slug: 'tech',
        description: 'Technology, software development, coding tutorials, and reviews.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'cat_design_123',
        name: 'Design',
        slug: 'design',
        description: 'UI/UX design, web aesthetics, layouts, and typography guide.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'cat_general_123',
        name: 'General',
        slug: 'general',
        description: 'General topics and announcements.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultCategories, null, 2));
  }
};

const loadMockCategories = () => {
  seedDefaultCategories();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveMockCategories = (categories) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(categories, null, 2));
};

class MockQuery {
  constructor(dataPromise) {
    this.dataPromise = dataPromise;
  }
  then(onFulfilled, onRejected) {
    return this.dataPromise.then(onFulfilled, onRejected);
  }
}


// ==========================================
// 3. DYNAMIC WRAPPER INTERFACE (PROXY)
// ==========================================
class CategoryWrapper {
  static find(query = {}) {
    if (global.useMockDb) {
      const categoriesPromise = (async () => {
        let categories = loadMockCategories();
        Object.keys(query).forEach((key) => {
          const val = query[key];
          categories = categories.filter((c) => c[key] !== undefined && c[key].toString() === val.toString());
        });
        return categories;
      })();
      return new MockQuery(categoriesPromise);
    } else {
      return MongooseCategory.find(query);
    }
  }

  static findOne(query = {}) {
    if (global.useMockDb) {
      const categoryPromise = (async () => {
        const categories = loadMockCategories();
        const found = categories.find((c) => {
          return Object.keys(query).every((key) => c[key] !== undefined && c[key].toString() === query[key].toString());
        });
        return found || null;
      })();
      return new MockQuery(categoryPromise);
    } else {
      return MongooseCategory.findOne(query);
    }
  }

  static findById(id) {
    if (global.useMockDb) {
      const categoryPromise = (async () => {
        const categories = loadMockCategories();
        const found = categories.find((c) => c._id === id.toString());
        return found || null;
      })();
      return new MockQuery(categoryPromise);
    } else {
      return MongooseCategory.findById(id);
    }
  }

  static async create(categoryData) {
    if (global.useMockDb) {
      const categories = loadMockCategories();
      const nameExists = categories.some((c) => c.name.toLowerCase() === categoryData.name.toLowerCase());
      if (nameExists) {
        throw new Error('Category already exists');
      }

      const newCategory = {
        _id: 'cat_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      categories.push(newCategory);
      saveMockCategories(categories);
      return newCategory;
    } else {
      return await MongooseCategory.create(categoryData);
    }
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    if (global.useMockDb) {
      const categories = loadMockCategories();
      const index = categories.findIndex((c) => c._id === id.toString());
      if (index === -1) return null;

      const updatedCategory = {
        ...categories[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      if (updateData.name && updateData.name.toLowerCase() !== categories[index].name.toLowerCase()) {
        const nameExists = categories.some((c) => c.name.toLowerCase() === updateData.name.toLowerCase() && c._id !== id.toString());
        if (nameExists) {
          throw new Error('Category name already exists');
        }
      }

      categories[index] = updatedCategory;
      saveMockCategories(categories);
      return updatedCategory;
    } else {
      return await MongooseCategory.findByIdAndUpdate(id, updateData, options);
    }
  }

  static async findByIdAndDelete(id) {
    if (global.useMockDb) {
      const categories = loadMockCategories();
      const index = categories.findIndex((c) => c._id === id.toString());
      if (index === -1) return null;

      const deletedCategory = categories.splice(index, 1)[0];
      saveMockCategories(categories);
      return deletedCategory;
    } else {
      return await MongooseCategory.findByIdAndDelete(id);
    }
  }

  static async countDocuments() {
    if (global.useMockDb) {
      const categories = loadMockCategories();
      return categories.length;
    } else {
      return await MongooseCategory.countDocuments();
    }
  }
}

export default CategoryWrapper;
export { MongooseCategory };
