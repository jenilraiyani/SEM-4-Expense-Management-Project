const categoryService = require('../services/categoryService');

exports.getAll = async (req, res) => {
  try {
    const data = await categoryService.getAllCategories();
    res.status(200).json({ success: true, count: data.length, data: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedData = await categoryService.updateCategory(req.params.id, req.body);
    if (!updatedData) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, data: updatedData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
  try {
    const deletedData = await categoryService.deleteCategory(req.params.id);
    if (!deletedData) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};