import jwt from 'jsonwebtoken';

// Generate JWT token that expires in 30 days
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export default generateToken;
