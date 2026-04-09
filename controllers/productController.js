import Product from '../models/productModel.js';
import Sports from '../models/sportsModel.js';
import Category from '../models/categoryModel.js';
import SubCategory from '../models/subCategoryModel.js';
import AppError from '../errors/AppError.js';
import mongoose from 'mongoose';
import { isValidId } from '../utils/isValidObjectId.js';
import Variant from '../models/variantModel.js';

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

  if (!name || !description || !sport || !subCategory || !category || !brand) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (!file) {
    throw new AppError('Product image is required', 400);
  }

  const thumbNailImage = `uploads/products/${file.filename}`;

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

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new AppError('Category not found', 404);
  }

  const subCategoryExists = await SubCategory.findById(subCategory);
  if (!subCategoryExists) {
    throw new AppError('Subcategory not found', 404);
  }

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
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new AppError('Invalid product id', 400);
  }

  const product = await Product.findById(id)
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

  if (!isValidId(id)) {
    throw new AppError('Invalid product ID', 400);
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const allowedFields = [
    'name',
    'description',
    'sport',
    'category',
    'subCategory',
    'brand',
    'minPrice',
    'maxPrice',
    'isFeatured',
    'isActive',
  ];

  const updatedData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updatedData[field] = req.body[field];
    }
  });

  ['sport', 'category', 'subCategory'].forEach((field) => {
    if (updatedData[field] && !isValidId(updatedData[field])) {
      throw new AppError(`Invalid ${field} ID`, 400);
    }
  });

  if (updatedData.category) {
    const category = await Category.findById(updatedData.category);

    if (!category) {
      throw new AppError('Category not found', 400);
    }

    if (updatedData.sport && category.sport.toString() !== updatedData.sport) {
      throw new AppError('Category does not belong to selected sport', 400);
    }
  }

  if (updatedData.subCategory) {
    const subCategory = await SubCategory.findById(updatedData.subCategory);

    if (!subCategory) {
      throw new AppError('SubCategory not found', 400);
    }

    if (
      updatedData.category &&
      subCategory.category.toString() !== updatedData.category
    ) {
      throw new AppError(
        'SubCategory does not belong to selected category',
        400,
      );
    }
  }

  if (req.file) {
    if (product.thumbNailImage) {
      fs.unlink(product.thumbNailImage, (err) => {
        if (err) console.error('Failed to delete:', err);
      });
    }
    updatedData.thumbNailImage = `uploads/products/${req.file.filename}`;
  }

  if (Object.keys(updatedData).length === 0 && !req.file) {
    throw new AppError('No data provided to update', 400);
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
    returnDocument: 'after',
    runValidators: true,
  })
    .populate('sport', 'name')
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

  if (!isValidId(id)) {
    throw new AppError('Invalid product ID', 400);
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const variantExists = await Variant.exists({ product: id });

  if (variantExists) {
    throw new AppError(
      'Cannot delete product with existing variants. Delete variants first.',
      400,
    );
  }

  try {
    if (product.thumbNailImage) {
      const filePath = path.resolve(product.thumbNailImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error('File delete failed:', err.message);
  }

  const deletedId = product._id;
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: { id: deletedId },
  });
};

export {
  createProducts,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
