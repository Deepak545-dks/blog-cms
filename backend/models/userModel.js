import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// ==========================================
// 1. MONGOOSE SCHEMA & MODEL SETUP
// ==========================================
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model('User', userSchema);


// ==========================================
// 2. MOCK JSON DATABASE SETUP
// ==========================================
const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

// Ensure database file and folder exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Pre-seed an admin user for easy demo testing
const seedAdminUser = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);
    const initialUsers = [
      {
        _id: '6696b9b3e100f28e2025170d',
        name: 'CMS Admin',
        email: 'admin@blogcms.com',
        password: hashedPassword,
        profileImage: '',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialUsers, null, 2));
  }
};

const loadMockUsers = () => {
  seedAdminUser();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveMockUsers = (users) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

const wrapMockUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    matchPassword: async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    }
  };
};

class MockQuery {
  constructor(userPromise) {
    this.userPromise = userPromise;
  }
  async select(fields) {
    const user = await this.userPromise;
    if (!user) return null;
    if (fields === '-password') {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return user;
  }
  then(onFulfilled, onRejected) {
    return this.userPromise.then(onFulfilled, onRejected);
  }
}


// ==========================================
// 3. DYNAMIC WRAPPER INTERFACE (PROXY)
// ==========================================
class UserWrapper {
  static async findOne({ email }) {
    if (global.useMockDb) {
      console.log(`[MOCK DB] findOne query for email: ${email}`);
      const users = loadMockUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return wrapMockUser(user);
    } else {
      return await MongooseUser.findOne({ email });
    }
  }

  static findById(id) {
    if (global.useMockDb) {
      console.log(`[MOCK DB] findById query for id: ${id}`);
      const userPromise = (async () => {
        const users = loadMockUsers();
        const user = users.find(u => u._id === id.toString());
        return wrapMockUser(user);
      })();
      return new MockQuery(userPromise);
    } else {
      return MongooseUser.findById(id);
    }
  }

  static async create(userData) {
    if (global.useMockDb) {
      console.log(`[MOCK DB] Creating user: ${userData.email}`);
      const users = loadMockUsers();
      
      const emailExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (emailExists) {
        throw new Error('User already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const newUser = {
        _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        profileImage: userData.profileImage || '',
        role: userData.role || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveMockUsers(users);
      return wrapMockUser(newUser);
    } else {
      return await MongooseUser.create(userData);
    }
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    if (global.useMockDb) {
      const users = loadMockUsers();
      const index = users.findIndex((u) => u._id === id.toString());
      if (index === -1) return null;

      // Hash password if updating password
      const preparedData = { ...updateData };
      if (preparedData.password) {
        const salt = await bcrypt.genSalt(10);
        preparedData.password = await bcrypt.hash(preparedData.password, salt);
      }

      const updatedUser = {
        ...users[index],
        ...preparedData,
        updatedAt: new Date().toISOString(),
      };

      users[index] = updatedUser;
      saveMockUsers(users);
      return wrapMockUser(updatedUser);
    } else {
      const preparedData = { ...updateData };
      if (preparedData.password) {
        const salt = await bcrypt.genSalt(10);
        preparedData.password = await bcrypt.hash(preparedData.password, salt);
      }
      return await MongooseUser.findByIdAndUpdate(id, preparedData, options);
    }
  }
}


export default UserWrapper;
