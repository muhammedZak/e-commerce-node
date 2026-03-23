import mongoose from 'mongoose';
import SubCategory from '../models/subCategoryModel.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import AppError from '../errors/AppError.js';
import { isValidId } from '../utils/isValidObjectId.js';
import Sports from '../models/sportsModel.js';

const createSubCategory = async (req, res) => {
  const { name, category, sport } = req.body;

  if (!name && !category && !sport) {
    throw new AppError('Name and category are required', 400);
  }

  if (!isValidId(category) && !isValidId(sport)) {
    throw new AppError('Invalid category or sport ID', 400);
  }

  const categoryExists = await Category.findById(category);
  const sportExists = await Sports.findById(sport);

  if (!categoryExists && !sportExists) {
    throw new AppError('Category or Sports not found', 404);
  }

  const subCategoryExists = await SubCategory.findOne({
    name: name.toLowerCase(),
    category,
  });

  if (subCategoryExists) {
    throw new AppError('Subcategory already exists in this category', 400);
  }

  const subCategory = await SubCategory.create({
    name: name.toLowerCase(),
    category,
    sport,
  });

  res.status(201).json({
    status: 'Success',
    message: 'Subcategory created successfully',
    data: subCategory,
  });
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

  const subCategory = await SubCategory.findById(id);

  if (!subCategory) {
    throw new AppError('Subcategory not found', 404);
  }

  if (name) {
    const subCategoryExists = await SubCategory.findOne({
      name: name.toLowerCase(),
      category: subCategory.category,
      sport: subCategory.sport,
    });

    if (subCategoryExists && subCategoryExists._id.toString() !== id) {
      throw new AppError('Subcategory already exists in this category', 400);
    }

    subCategory.name = name.toLowerCase();
  }

  const updatedSubCategory = await subCategory.save();

  res.status(200).json({
    status: 'Success',
    message: 'Subcategory updated successfully',
    data: updatedSubCategory,
  });
};

const deleteSubCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
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
