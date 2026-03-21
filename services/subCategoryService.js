const SubCategory = require('../models/SubCategory');

exports.getAllSubCategories = async () => {
  return await SubCategory.find().populate('CategoryData');
};

exports.createSubCategory = async (data) => {
  // Get the last subcategory to determine next SubCategoryID
  const lastSubCategory = await SubCategory.findOne().sort({ SubCategoryID: -1 });
  let nextSubCategoryID = 11;

  if (lastSubCategory && lastSubCategory.SubCategoryID) {
    nextSubCategoryID = lastSubCategory.SubCategoryID + 1;
  }

  // Create new subcategory with auto-incremented ID
  const newSubCategory = new SubCategory({
    ...data,
    SubCategoryID: nextSubCategoryID
  });
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

// 👇 ADD THIS NEW FUNCTION 👇
exports.getSubCategoriesByUserId = async (userId) => {
  return await SubCategory.find({ UserID: userId }).populate('CategoryData');
};