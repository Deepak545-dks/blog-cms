import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // 3 seconds timeout to prevent hanging the startup if MongoDB is not running
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog_cms', {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.log('--- FALLING BACK TO LOCAL MOCK JSON DATABASE ---');
    global.useMockDb = true;
  }
};

export default connectDB;
