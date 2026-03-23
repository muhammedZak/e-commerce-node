import mongoose from 'mongoose';

const sportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

const Sports = mongoose.model('Sports', sportSchema);

export default Sports;
