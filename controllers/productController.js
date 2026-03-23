import Product from '../models/productModel.js';
import Sports from '../models/sportsModel.js';
import Category from '../models/categoryModel.js';
import SubCategory from '../models/subCategoryModel.js';
import AppError from '../errors/AppError.js';
import mongoose from 'mongoose';
import { isValidId } from '../utils/isValidObjectId.js';

const createProducts = async (req, res) => {
  const {
    name,
    description,
    sport,
    category,
    subCategory,
    brand,
    isFeatured,
    isActive,
  } = req.body;

  const file = req.file;

  console.log('BODY:', req.body);
  console.log('FILE:', req.file);

  if (!name || !description || !sport || !subCategory || !category || !brand) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (!file) {
    throw new AppError('Product image is required', 400);
  }

  const thumbNailImage = `uploads/products/${file.filename}`;

  console.log('first');

  if (
    (sport && !isValidId(sport)) ||
    (category && !isValidId(category)) ||
    (subCategory && !isValidId(subCategory))
  ) {
    throw new AppError('Invalid ID provided', 400);
  }

  const sportExists = await Sports.findById(sport);
  if (!sportExists) {
    throw new AppError('Sport not found', 404);
  }

  console.log('2');
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new AppError('Category not found', 404);
  }
  console.log('3');

  const subCategoryExists = await SubCategory.findById(subCategory);
  if (!subCategoryExists) {
    throw new AppError('Subcategory not found', 404);
  }

  console.log('4');
  const product = await Product.create({
    name,
    description,
    sport,
    category,
    subCategory,
    brand,
    thumbNailImage,
    isFeatured,
    isActive,
  });
  console.log('5');
  res.status(201).json({
    status: 'Success',
    message: 'Product created successfully',
    data: product,
  });
};

const getProducts = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    subCategory,
    sports,
    brand,
    search,
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;
  if (sports) query.sports = sports;
  if (brand) query.brand = brand;

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .populate('sport', 'name')
    .populate('category', 'name')
    .populate('subCategory', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const count = await Product.countDocuments();
  const totalProducts = await Product.countDocuments(query);

  res.status(200).json({
    count,
    success: true,
    totalProducts,
    currentPage: Number(page),
    totalPages: Math.ceil(totalProducts / limit),
    data: products,
  });
};

const getProduct = async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product id', 400);
  }

  const product = await Product.findById(productId)
    .populate('sport', 'name')
    .populate('category', 'name')
    .populate('subCategory', 'name');

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
};

const updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid product ID', 400);
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('sports', 'name')
    .populate('category', 'name')
    .populate('subCategory', 'name');

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct,
  });
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid product ID', 400);
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
};

export {
  createProducts,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
