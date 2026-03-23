import mongoose from 'mongoose';
import dotenv from 'dotenv';

import connectDB from './config/db.js';

import Sports from './models/sportsModel.js';
import Category from './models/categoryModel.js';
import SubCategory from './models/subCategoryModel.js';
import Product from './models/productModel.js';
import Variant from './models/variantsModel.js';

import { sports } from './seed/sports.js';
import { categories } from './seed/categories.js';
import { subCategories } from './seed/subcategories.js';
import { products } from './seed/product.js';
import { variants } from './seed/variant.js';

dotenv.config();

await connectDB();

const importData = async () => {
  try {
    await Variant.deleteMany();
    await Product.deleteMany();
    await SubCategory.deleteMany();
    await Category.deleteMany();
    await Sports.deleteMany();

    console.log('Old data removed');

    const createdSports = await Sports.insertMany(sports);

    const categoriesWithSport = categories.map((cat) => ({
      ...cat,
      sport: createdSports[0]._id,
    }));

    const createdCategories = await Category.insertMany(categoriesWithSport);

    console.log('Sports & Categories inserted');

    // Example: assign category to subcategory
    const subCategoriesWithRelations = subCategories.map((sub) => ({
      ...sub,
      sport: createdSports[0]._id,
      category: createdCategories[0]._id,
    }));

    const createdSubCategories = await SubCategory.insertMany(
      subCategoriesWithRelations,
    );

    console.log('Subcategories inserted');

    const productsWithRelations = products.map((product) => ({
      ...product,
      sport: createdSports[0]._id,
      category: createdCategories[0]._id,
      subCategory: createdSubCategories[0]._id,
    }));

    const createdProducts = await Product.insertMany(productsWithRelations);

    console.log('Products inserted');

    const variantsWithProduct = variants.map((variant) => ({
      ...variant,
      productId: createdProducts[0]._id,
    }));

    await Variant.insertMany(variantsWithProduct);

    console.log('Variants inserted');

    console.log('Database Seeded Successfully');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
