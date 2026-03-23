import Product from '../models/productModel.js';
import Variant from '../models/variantsModel.js';
import Cart from '../models/cartModel.js';
import AppError from '../errors/AppError.js';

const addToCart = async (req, res) => {
  const userId = req.user._id;
  const { variantId, quantity = 1 } = req.body;

  const variant = await Variant.findById(variantId);

  if (!variant) {
    throw new AppError('Variant not found', 404);
  }

  const product = await Product.findById(variant.productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: [],
    });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.variantId.toString() === variantId,
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;

    cart.items[existingItemIndex].subtotal =
      cart.items[existingItemIndex].price *
      cart.items[existingItemIndex].quantity;
  } else {
    const newItem = {
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      brand: product.brand,
      color: variant.color,
      size: variant.size,
      image: variant.images[0],
      price: variant.price,
      quantity,
      subtotal: variant.price * quantity,
    };
    cart.items.push(newItem);
  }

  cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  cart.totalPrice = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: cart,
  });
};

const getCart = async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(200).json({
      success: true,
      message: 'Cart is empty',
      data: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
};

const updateCart = async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw new AppError('Quantity must be greater than 0', 400);
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw new AppError('Cart item not found', 404);
  }

  item.quantity = quantity;

  item.subtotal = item.price * quantity;

  cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  cart.totalPrice = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart updated successfully',
    data: cart,
  });
};

const removeCartItem = async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId,
  );

  if (itemIndex === -1) {
    throw new AppError('Item not found in cart', 404);
  }

  cart.items.splice(itemIndex, 1);

  cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  cart.totalPrice = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: cart,
  });
};

const clearCart = async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  cart.items = [];

  cart.totalItems = 0;
  cart.totalPrice = 0;

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: cart,
  });
};

export { addToCart, getCart, updateCart, removeCartItem, clearCart };
