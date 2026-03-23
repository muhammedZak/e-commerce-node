import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sports',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
categorySchema.index({ name: 1, sport: 1 }, { unique: true });
const Category = mongoose.model('Category', categorySchema);

export default Category;
