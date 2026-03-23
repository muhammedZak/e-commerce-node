import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import AppError from '../errors/AppError.js';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.token;

  if (!token) {
    throw new AppError('Not authorized, no token', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    throw new AppError('Invalid token', 401);
  }

  const user = await User.findById(decoded.userId).select('-password');

  if (!user) {
    throw new AppError('No user found', 401);
  }

  req.user = user;

  next();
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw new AppError('Not authorized as admin', 401);
  }
};

export { protect, admin };
