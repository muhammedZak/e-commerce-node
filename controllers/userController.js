import User from '../models/userModel.js';
import AppError from '../errors/AppError.js';

const getUserProfile = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(201).json({
    success: true,
    message: 'Succussfully fetched user',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export { getUserProfile };
