import Variant from '../models/variantsModel.js';
import Product from '../models/productModel.js';

export const updateProductPrice = async (productId) => {
  const variants = await Variant.find({ productId });

  if (variants.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      minPrice: 0,
      maxPrice: 0,
    });
    return;
  }

  const prices = variants.map((v) => v.price);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  await Product.findByIdAndUpdate(productId, {
    minPrice,
    maxPrice,
  });
};
