import Variant from '../models/variantsModel.js';
import Product from '../models/productModel.js';
import AppError from '../errors/AppError.js';
import { isValidId } from '../utils/isValidObjectId.js';

const createVariant = async (req, res) => {
  const { name, productId, color, size, price, stock, images, isAvailable } =
    req.body;

  if (!name || !productId || !price) {
    throw new AppError('Name, productId and price are required', 400);
  }

  if (!isValidId(productId)) {
    throw new AppError('Invalid product ID', 400);
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const variant = await Variant.create({
    name,
    productId,
    color,
    size,
    price,
    stock,
    images,
    isAvailable,
  });

  res.status(201).json({
    success: true,
    message: 'Variant created successfully',
    data: variant,
  });
};

const getVariants = async (req, res) => {
  const { productId } = req.params;

  const query = {};

  if (productId) {
    query.productId = productId;
  }

  const variants = await Variant.find(query)
    .populate('productId', 'name brand')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: variants.length,
    data: variants,
  });
};

const getVariantById = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new AppError('Invalid variant ID', 400);
  }

  const variant = await Variant.findById(id).populate(
    'productId',
    'name brand',
  );

  if (!variant) {
    throw new AppError('Variant not found', 404);
  }

  res.status(200).json({
    success: true,
    data: variant,
  });
};

const updateVariant = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new AppError('Invalid variant ID', 400);
  }

  const updatedVariant = await Variant.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate('productId', 'name brand');

  if (!updatedVariant) {
    throw new AppError('Variant not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Variant updated successfully',
    data: updatedVariant,
  });
};

const deleteVariant = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new AppError('Invalid variant ID', 400);
  }

  const deletedVariant = await Variant.findByIdAndDelete(id);

  if (!deletedVariant) {
    throw new AppError('Variant not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Variant deleted successfully',
    data: deletedVariant._id,
  });
};

export { createVariant, getVariants, updateVariant, deleteVariant };
