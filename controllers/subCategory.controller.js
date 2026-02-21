const subCategoryService = require('../services/subCategoryService');

exports.getAll = async (req, res) => {
  try {
    const data = await subCategoryService.getAllSubCategories();
    res.status(200).json({ success: true, count: data.length, data: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await subCategoryService.createSubCategory(req.body);
    res.status(201).json({ success: true, data: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedData = await subCategoryService.updateSubCategory(req.params.id, req.body);
    if (!updatedData) return res.status(404).json({ success: false, message: "SubCategory not found" });
    res.status(200).json({ success: true, data: updatedData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getSubCategoryById = async (req, res) => {
    try {
        const subCat = await subCategoryService.getSubCategoryById(req.params.id);
        if (!subCat) return res.status(404).json({ success: false, message: "SubCategory not found" });
        res.json({ success: true, data: subCat });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
  try {
    const deletedData = await subCategoryService.deleteSubCategory(req.params.id);
    if (!deletedData) return res.status(404).json({ success: false, message: "SubCategory not found" });
    res.status(200).json({ success: true, message: "SubCategory deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};