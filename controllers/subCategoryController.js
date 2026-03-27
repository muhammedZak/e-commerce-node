import mongoose from 'mongoose';
import SubCategory from '../models/subCategoryModel.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import AppError from '../errors/AppError.js';
import { isValidId } from '../utils/isValidObjectId.js';
import Sports from '../models/sportsModel.js';

const createSubCategory = async (req, res) => {
  const { name, category } = req.body;

  if (!name?.trim() || !category) {
    throw new AppError('Name and category are required', 400);
  }

  if (!isValidId(category)) {
    throw new AppError('Invalid category or sport ID', 400);
  }

  const categoryExists = await Category.findById(category);

  if (!categoryExists) {
    throw new AppError('Category not found', 404);
  }

  try {
    const subCategory = await SubCategory.create({
      name,
      category,
    });

    res.status(201).json({
      status: 'Success',
      message: 'Subcategory created successfully',
      data: subCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Subcategory already exists in this category', 400);
    }
    throw error;
  }
};

const getAllSubCategory = async (req, res) => {
  const subCategories = await SubCategory.find()
    .populate('category', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'Success',
    count: subCategories.length,
    data: subCategories,
  });
};

const getSubCategoriesByCategory = async (req, res) => {
  const { categoryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new AppError('Invalid category ID', 400);
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const subCategories = await SubCategory.find({ category: categoryId }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: 'Success',
    count: subCategories.length,
    data: subCategories,
  });
};

const getSingleSubCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid subcategory ID', 400);
  }

  const subCategory = await SubCategory.findById(id).populate(
    'category',
    'name',
  );

  if (!subCategory) {
    throw new AppError('Subcategory not found', 404);
  }

  res.status(200).json({
    status: 'Success',
    data: subCategory,
  });
};

const updateSubCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!isValidId(id)) {
    throw new AppError('Invalid subcategory ID', 400);
  }

  if (!name?.trim()) {
    throw new AppError('Name is required', 400);
  }

  const subCategory = await SubCategory.findById(id);

  if (!subCategory) {
    throw new AppError('Subcategory not found', 404);
  }

  subCategory.name = name;

  try {
    const updatedSubCategory = await subCategory.save();

    res.status(200).json({
      status: 'Success',
      message: 'Subcategory updated successfully',
      data: updatedSubCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Subcategory already exists in this category', 400);
    }
    throw error;
  }
};

const deleteSubCategory = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new AppError('Invalid subcategory ID', 400);
  }

  const subCategory = await SubCategory.findById(id);

  if (!subCategory) {
    throw new AppError('Subcategory not found', 404);
  }

  const productExists = await Product.findOne({ subCategory: id });

  if (productExists) {
    throw new AppError('Cannot delete subcategory linked with products', 400);
  }

  await subCategory.deleteOne();

  res.status(200).json({
    status: 'Success',
    message: 'Subcategory deleted successfully',
  });
};

export {
  createSubCategory,
  getAllSubCategory,
  getSubCategoriesByCategory,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
