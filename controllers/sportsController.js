import mongoose from 'mongoose';
import Sports from '../models/sportsModel.js';
import AppError from '../errors/AppError.js';
import { isValidId } from '../utils/isValidObjectId.js';
import Category from '../models/categoryModel.js';

const createSport = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new AppError('Sport name is required', 400);
  }

  try {
    const sport = await Sports.create({
      name,
    });

    res.status(201).json({
      status: 'Success',
      message: 'Sport created successfully',
      data: sport,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Sport already exists', 400);
    }
    throw error;
  }
};

const getAllSports = async (req, res) => {
  const sports = await Sports.find();

  res.status(200).json({
    status: 'Success',
    data: sports,
  });
};

const getSingleSport = async (req, res) => {
  if (isValidId(req.params.id)) {
    throw new AppError('Invalid sport ID', 400);
  }

  const sport = await Sports.findById(req.params.id);

  if (!sport) {
    throw new AppError('Sport not found', 404);
  }

  res.status(200).json({
    status: 'Success',
    data: sport,
  });
};

const updateSport = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name || !name.trim()) {
    throw new AppError('Name requiredaaaaaa', 400);
  }

  if (!isValidId(id)) {
    throw new AppError('Invalid sport ID', 400);
  }

  const sport = await Sports.findById(id);

  if (!sport) {
    throw new AppError('Sport not found', 404);
  }

  sport.name = name;

  try {
    const updatedSport = await sport.save();

    res.status(200).json({
      status: 'Success',
      message: 'Sport updated successfully',
      data: updatedSport,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Sport already exists', 400);
    }
    throw error;
  }
};

const deleteSport = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new AppError('Invalid sport ID', 400);
  }

  const categoryExists = await Category.exists({ sport: id });

  if (categoryExists) {
    throw new AppError('Cannot delete sport with existing categories', 400);
  }

  const sport = await Sports.findById(id);

  if (!sport) {
    throw new AppError('Sport not found', 404);
  }

  await sport.deleteOne();

  res.status(200).json({
    status: 'Success',
    message: 'Sport deleted successfully',
  });
};

export { createSport, getAllSports, getSingleSport, updateSport, deleteSport };
