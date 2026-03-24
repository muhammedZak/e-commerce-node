import mongoose from 'mongoose';
import Category from '../models/categoryModel.js';
import Sports from '../models/sportsModel.js';
import SubCategory from '../models/subCategoryModel.js';
import AppError from '../errors/AppError.js';
import { isValidId } from '../utils/isValidObjectId.js';

const createCategory = async (req, res) => {
  const { name, sport } = req.body;

  if (!name || !name.trim() || !sport) {
    throw new AppError('category and sport is required.', 400);
  }

  if (!isValidId(sport)) {
    throw new AppError('Invalid objectId', 400);
  }

  const sportExists = await Sports.findById(sport);
  if (!sportExists) {
    throw new AppError('Sport not found', 404);
  }

  try {
    const category = await Category.create({
      name: name,
      sport,
    });
    res.status(201).json({
      status: 'Success',
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Sport already exists', 400);
    }
    throw error;
  }
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

  if (!isValidId(id)) {
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

  if (!name || !name.trim()) {
    throw new AppError('Name is required', 400);
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  category.name = name;

  try {
    const updatedCategory = await category.save();
    res.status(200).json({
      status: 'Success',
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Category already exists in this sport', 400);
    }
    throw error;
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new AppError('Invalid category ID', 400);
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const subCategoryExists = await SubCategory.exists({
    category: id,
  });

  if (subCategoryExists) {
    throw new AppError('Cannot delete category with subcategories', 400);
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
