const Category = require('../models/Category');

exports.getAllCategories = async () => {
  return await Category.find();
};

exports.createCategory = async (data) => {
  const newCategory = new Category(data);
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