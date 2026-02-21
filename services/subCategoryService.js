const SubCategory = require('../models/SubCategory');

exports.getAllSubCategories = async () => {
  return await SubCategory.find().populate('CategoryData');
};

exports.createSubCategory = async (data) => {
  const newSubCategory = new SubCategory(data);
  return await newSubCategory.save();
};

exports.updateSubCategory = async (id, data) => {
  return await SubCategory.findOneAndUpdate({ SubCategoryID: id }, data, { new: true });
};

exports.getSubCategoryById = async (id) => {
    return await SubCategory.findOne({ SubCategoryID: id }).populate('CategoryData');
};

exports.deleteSubCategory = async (id) => {
  return await SubCategory.findOneAndDelete({ SubCategoryID: id });
};