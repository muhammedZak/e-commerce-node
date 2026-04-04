import fs from 'fs';
import Variant from '../models/variantsModel.js';
import Product from '../models/productModel.js';
import AppError from '../errors/AppError.js';
import { isValidId } from '../utils/isValidObjectId.js';

const createVariant = async (req, res) => {
  const { name, productId, color, size, price, stock, isAvailable } = req.body;

  if (!name || !productId || !price) {
    throw new AppError('Name, productId and price are required', 400);
  }

  if (!isValidId(productId)) {
    throw new AppError('Invalid product ID', 400);
  }

  const parsedPrice = Number(price);
  const parsedStock = Number(stock || 0);

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    throw new AppError('Invalid price value', 400);
  }

  if (isNaN(parsedStock) || parsedStock < 0) {
    throw new AppError('Invalid stock value', 400);
  }

  const normalizedColor = color?.trim() || undefined;
  const normalizedSize = size?.trim() || undefined;

  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const existingVariant = await Variant.findOne({
    productId,
    color: normalizedColor,
    size: normalizedSize,
  });

  if (existingVariant) {
    throw new AppError('Variant with same color and size already exists', 400);
  }

  let imagePaths = [];

  if (req.files && req.files.length > 0) {
    imagePaths = req.files.map((file) => file.path.replace(/\\/g, '/'));
  } else {
    throw new AppError('At least one image is required', 400);
  }

  const availability =
    typeof isAvailable === 'boolean' ? isAvailable : isAvailable === 'true';

  const variant = await Variant.create({
    name: name.trim(),
    productId,
    color: normalizedColor,
    size: normalizedSize,
    price: parsedPrice,
    stock: parsedStock,
    images: imagePaths,
    isAvailable: availability,
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

  const existingVariant = await Variant.findById(id);

  if (!existingVariant) {
    throw new AppError('Variant not found', 404);
  }

  delete req.body.productId;

  const updateData = { ...req.body };

  if (updateData.name) {
    updateData.name = updateData.name.trim();
  }

  if (updateData.color !== undefined) {
    updateData.color = updateData.color.trim() || undefined;
  }

  if (updateData.size !== undefined) {
    updateData.size = updateData.size.trim() || undefined;
  }

  if (updateData.price !== undefined) {
    const price = Number(updateData.price);
    if (isNaN(price) || price < 0) {
      throw new AppError('Invalid price value', 400);
    }
    updateData.price = price;
  }

  if (updateData.stock !== undefined) {
    const stock = Number(updateData.stock);
    if (isNaN(stock) || stock < 0) {
      throw new AppError('Invalid stock value', 400);
    }
    updateData.stock = stock;
  }

  if (updateData.isAvailable !== undefined) {
    updateData.isAvailable =
      updateData.isAvailable === true || updateData.isAvailable === 'true';
  }

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => file.path.replace(/\\/g, '/'));

    existingVariant.images.forEach((imgPath) => {
      fs.unlink(imgPath, (err) => {
        if (err) console.error('Failed to delete old image:', err);
      });
    });

    updateData.images = newImages;
  }

  if (updateData.color || updateData.size) {
    const color = updateData.color ?? existingVariant.color;
    const size = updateData.size ?? existingVariant.size;

    const duplicate = await Variant.findOne({
      productId: existingVariant.productId,
      color,
      size,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new AppError(
        'Another variant with same color and size exists',
        400,
      );
    }
  }

  const updatedVariant = await Variant.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('productId', 'name brand');

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
