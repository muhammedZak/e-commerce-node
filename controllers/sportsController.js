import mongoose from 'mongoose';
import Sports from '../models/sportsModel.js';
import AppError from '../errors/AppError.js';
import { isValidId } from '../utils/isValidObjectId.js';

const createSport = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new AppError('Sport name is required', 400);
  }
  const sportExist = await Sports.findOne({ name: name.toLowerCase() });

  if (sportExist) {
    throw new AppError('Sport already exists.', 400);
  }

  const sport = await Sports.create({
    name: name.toLowerCase(),
  });

  res.status(201).json({
    status: 'Success',
    message: 'Sport created successfully',
    data: sport,
  });
};

const getAllSports = async (req, res) => {
  const sports = await Sports.find();

  res.status(200).json({
    status: 'Success',
    data: sports,
  });
};

const getSingleSport = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
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

  if (!isValidId(id)) {
    throw new AppError('Invalid sport ID', 400);
  }

  const sport = await Sports.findById(id);

  if (!sport) {
    throw new AppError('Sport not found', 404);
  }

  if (name) {
    const sportExist = await Sports.findOne({
      name: name.toLowerCase(),
    });

    if (sportExist && sportExist._id.toString() !== id) {
      throw new AppError('Sport already exists', 400);
    }
    sport.name = name.toLowerCase();
  }

  const updatedSport = await sport.save();

  res.status(200).json({
    status: 'Success',
    message: 'Sport updated successfully',
    data: updatedSport,
  });
};

const deleteSport = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid sport ID', 400);
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
