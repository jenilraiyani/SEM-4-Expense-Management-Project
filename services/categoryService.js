const Category = require('../models/Category');

exports.getAllCategories = async () => {
  return await Category.find();
};

exports.createCategory = async (data) => {

  // Get the last category to determine next CategoryID
  const lastCategory = await Category.findOne().sort({ CategoryID: -1 });
  let nextCategoryID = 1;

  if (lastCategory && lastCategory.CategoryID) {
    nextCategoryID = lastCategory.CategoryID + 1;
  }

  // Create new category with auto-incremented ID
  const newCategory = new Category({
    ...data,
    CategoryID: nextCategoryID
  });
  return await newCategory.save();
};

exports.updateCategory = async (id, data) => {
  return await Category.findOneAndUpdate({ CategoryID: id }, data, { new: true });
};

exports.getCategoryById = async (id) => {
  return await Category.findOne({ CategoryID: id });
};

exports.deleteCategory = async (id) => {
  return await Category.findOneAndDelete({ CategoryID: id });
};