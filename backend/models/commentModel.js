import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// ==========================================
// 1. MONGOOSE SCHEMA & MODEL SETUP
// ==========================================
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseComment = mongoose.model('Comment', commentSchema);


// ==========================================
// 2. MOCK JSON DATABASE SETUP
// ==========================================
const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'comments.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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

const loadMockComments = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {}
  return [];
};

const saveMockComments = (comments) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(comments, null, 2));
};

// Mock Query Class to support populate
class MockCommentQuery {
  constructor(dataPromise) {
    this.dataPromise = dataPromise;
  }

  async populate(field, fieldsToSelect) {
    const data = await this.dataPromise;
    if (!data) return null;

    const isArray = Array.isArray(data);
    const items = isArray ? data : [data];

    if (field === 'user') {
      const users = loadMockUsers();
      items.forEach((item) => {
        const userIdStr = item.user.toString();
        const userObj = users.find((u) => u._id === userIdStr);

        if (userObj) {
          const populatedUser = {};
          if (fieldsToSelect) {
            const selectList = fieldsToSelect.split(' ');
            selectList.forEach((f) => {
              populatedUser[f] = userObj[f];
            });
          } else {
            const { password, ...rest } = userObj;
            Object.assign(populatedUser, rest);
          }
          item.user = populatedUser;
        } else {
          item.user = { name: 'Deleted User', profileImage: '' };
        }
      });
    }

    return isArray ? items : items[0];
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
    return new MockCommentQuery(sortedPromise);
  }

  then(onFulfilled, onRejected) {
    return this.dataPromise.then(onFulfilled, onRejected);
  }
}


// ==========================================
// 3. DYNAMIC WRAPPER INTERFACE (PROXY)
// ==========================================
class CommentWrapper {
  static find(query = {}) {
    if (global.useMockDb) {
      const commentsPromise = (async () => {
        let comments = loadMockComments();
        Object.keys(query).forEach((key) => {
          const val = query[key];
          comments = comments.filter((c) => c[key] !== undefined && c[key].toString() === val.toString());
        });
        return comments;
      })();
      return new MockCommentQuery(commentsPromise);
    } else {
      return MongooseComment.find(query);
    }
  }

  static findById(id) {
    if (global.useMockDb) {
      const commentPromise = (async () => {
        const comments = loadMockComments();
        const found = comments.find((c) => c._id === id.toString());
        return found || null;
      })();
      return new MockCommentQuery(commentPromise);
    } else {
      return MongooseComment.findById(id);
    }
  }

  static async create(commentData) {
    if (global.useMockDb) {
      const comments = loadMockComments();

      const newComment = {
        _id: 'comm_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        user: commentData.user.toString(),
        blog: commentData.blog.toString(),
        content: commentData.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      comments.push(newComment);
      saveMockComments(comments);
      return newComment;
    } else {
      return await MongooseComment.create(commentData);
    }
  }

  static async findByIdAndDelete(id) {
    if (global.useMockDb) {
      const comments = loadMockComments();
      const index = comments.findIndex((c) => c._id === id.toString());
      if (index === -1) return null;

      const deletedComment = comments.splice(index, 1)[0];
      saveMockComments(comments);
      return deletedComment;
    } else {
      return await MongooseComment.findByIdAndDelete(id);
    }
  }

  static async deleteMany(query = {}) {
    if (global.useMockDb) {
      let comments = loadMockComments();
      // Filter out comments matching the query
      const originalLength = comments.length;
      comments = comments.filter((c) => {
        return !Object.keys(query).every((key) => {
          return c[key] !== undefined && c[key].toString() === query[key].toString();
        });
      });
      saveMockComments(comments);
      return { deletedCount: originalLength - comments.length };
    } else {
      return await MongooseComment.deleteMany(query);
    }
  }

  static async countDocuments(query = {}) {
    if (global.useMockDb) {
      let comments = loadMockComments();
      Object.keys(query).forEach((key) => {
        const val = query[key];
        comments = comments.filter((c) => c[key] !== undefined && c[key].toString() === val.toString());
      });
      return comments.length;
    } else {
      return await MongooseComment.countDocuments(query);
    }
  }
}

export default CommentWrapper;
export { MongooseComment };
