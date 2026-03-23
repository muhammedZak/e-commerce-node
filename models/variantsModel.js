import mongoose from 'mongoose';

const variantsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    color: String,
    size: String,
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    images: [String],
  },
  {
    timestamps: true,
  },
);

const Variant = mongoose.model('Variant', variantsSchema);

export default Variant;
