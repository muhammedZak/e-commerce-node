import mongoose from 'mongoose';
import Category from '../models/categoryModel.js';
import AppError from '../errors/AppError.js';
import { isValidId } from '../utils/isValidObjectId.js';

const createCategory = async (req, res) => {
  const { name, sport } = req.body;

  if (!name && !sport) {
    throw new AppError('category and sport is required.', 400);
  }

  const categoryExists = await Category.findOne({
    name: name.toLowerCase(),
  });

  if (categoryExists) {
    throw new AppError('Category already exists', 400);
  }

  const isValid = isValidId(sport);
  if (!isValid) {
    throw new AppError('Invalid objectId', 400);
  }

  const category = await Category.create({
    name: name.toLowerCase(),
    sport,
  });

  res.status(201).json({
    status: 'Success',
    message: 'Category created successfully',
    data: category,
  });
};

const getAllCategory = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: 'Success',
    count: categories.length,
    data: categories,
  });
};

const getSingleCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid category ID', 400);
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.status(200).json({
    status: 'Success',
    data: category,
  });
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!isValidId(id)) {
    throw new AppError('Invalid category ID', 400);
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (name) {
    const categoryExists = await Category.findOne({
      name: name.toLowerCase(),
    });

    if (categoryExists && categoryExists._id.toString() !== id) {
      throw new AppError('Category already exists', 400);
    }

    category.name = name.toLowerCase();
  }

  const updatedCategory = await category.save();

  res.status(200).json({
    status: 'Success',
    message: 'Category updated successfully',
    data: updatedCategory,
  });
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid category ID', 400);
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  await category.deleteOne();

  res.status(200).json({
    status: 'Success',
    message: 'Category deleted successfully',
  });
};

export {
  createCategory,
  getAllCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
