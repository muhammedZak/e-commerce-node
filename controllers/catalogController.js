import Sports from '../models/sportsModel.js';
import Category from '../models/categoryModel.js';
import SubCategory from '../models/subCategoryModel.js';

const getCatalog = async (req, res) => {
  const sports = await Sports.find();
  const categories = await Category.find();
  const subCategories = await SubCategory.find();

  res.json({
    status: 'Success',
    sports,
    categories,
    subCategories,
  });
};

export { getCatalog };
