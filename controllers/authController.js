import crypto from 'crypto';
import User from '../models/userModel.js';
import AppError from '../errors/AppError.js';
import generateToken from '../utils/generateToken.js';
import { sendMail } from '../utils/sendMail.js';

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Category name is required', 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError('User already exists', 409);
  }

  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(emailVerificationToken)
    .digest('hex');

  const user = await User.create({
    name,
    email,
    password,
    emialVerificationToken: hashedToken,
    emialVerificationTokenExpiry: Date.now() + 10 * 60 * 1000,
  });

  const url = `http://localhost:5000/api/auth/verify-email/${emailVerificationToken}`;

  await sendMail(user.email, url, 'Email');

  res.status(201).json({
    status: 'Success',
    message: 'User registered successfully. Please verify your email.',
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: true,
    message: 'Login successfull',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const userLogOut = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('No user found with this email', 404);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  const url = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

  await sendMail(user.email, url, 'Password');

  res.status(201).json({
    status: 'Success',
    message:
      'Your password reset email has been sent to you email, Please check your email to reset your password!.',
  });
};

const resetpassword = async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  const resetToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('No user found ', 404);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
};

const verifyEmail = async (req, res) => {
  const token = req.params.token;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emialVerificationToken: hashedToken,
    emialVerificationTokenExpiry: { $gt: Date.now() },
  });
  console.log('working...');
  if (!user) {
    throw new AppError('Invalid or expired verification link', 404);
  }

  user.isVerified = true;
  user.emialVerificationToken = undefined;
  user.emialVerificationTokenExpiry = undefined;
  await user.save();
  console.log('working...');

  res.status(200).json({
    success: true,
    message: 'Email verification has been successfully completed!',
  });
};

export {
  registerUser,
  loginUser,
  forgotPassword,
  userLogOut,
  resetpassword,
  verifyEmail,
};
