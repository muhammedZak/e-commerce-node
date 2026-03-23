import Order from '../models/orderModel.js';
import Variant from '../models/variantsModel.js';
import Cart from '../models/cartModel.js';
import AppError from '../errors/AppError.js';
import mongoose from 'mongoose';

const createOrder = async (req, res) => {
  const userId = req.user._id;

  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  for (const item of cart.items) {
    const variant = await Variant.findById(item.variantId);

    if (!variant) {
      throw new AppError(`Variant not found`, 404);
    }

    if (variant.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${item.name}`, 400);
    }
  }

  const orderItems = cart.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    name: item.name,
    brand: item.brand,
    image: item.image,
    color: item.color,
    size: item.size,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));

  const order = await Order.create({
    userId,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice: cart.totalPrice,
    taxPrice: 0,
    shippingPrice: 0,
    totalPrice: cart.totalPrice,
  });

  for (const item of cart.items) {
    await Variant.findByIdAndUpdate(
      item.variantId,
      { $inc: { stock: -item.quantity } },
      { new: true },
    );
  }

  cart.items = [];
  cart.totalItems = 0;
  cart.totalPrice = 0;

  await cart.save();

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order,
  });
};

const getMyOrders = async (req, res) => {
  const userId = req.user._id;

  const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid order id', 400);
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to view this order', 403);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
};

const updateOrderPayment = async (req, res) => {
  const { id } = req.params;

  const { paymentId, paymentStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid order ID', 400);
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.paymentStatus = paymentStatus || 'PAID';
  order.paidAt = new Date();

  order.paymentResult = {
    paymentId,
    status: paymentStatus,
  };

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Payment updated successfully',
    data: order,
  });
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid order ID', 400);
  }

  const validStatuses = [
    'PLACED',
    'CONFIRMED',
    'PACKED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid order status', 400);
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.orderStatus = status;

  if (status === 'DELIVERED') {
    order.deliveredAt = new Date();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
};

export {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderPayment,
  updateOrderStatus,
};
