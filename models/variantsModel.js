import mongoose from 'mongoose';
import { updateProductPrice } from '../utils/updateProductPrice.js';

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

// ✅ After SAVE (create)
variantsSchema.post('save', async function () {
  await updateProductPrice(this.productId);
});

variantsSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await updateProductPrice(doc.productId);
  }
});

variantsSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await updateProductPrice(doc.productId);
  }
});

const Variant = mongoose.model('Variant', variantsSchema);

export default Variant;
