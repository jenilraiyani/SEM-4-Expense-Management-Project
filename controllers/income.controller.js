const incomeService = require('../services/incomeService');

exports.getAll = async (req, res) => {
  try {
    const data = await incomeService.getAllIncomes();
    res.status(200).json({ success: true, count: data.length, data: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await incomeService.createIncome(req.body);
    res.status(201).json({ success: true, data: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedData = await incomeService.updateIncome(req.params.id, req.body);
    if (!updatedData) return res.status(404).json({ success: false, message: "Income not found" });
    res.status(200).json({ success: true, data: updatedData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getIncomeById = async (req, res) => {
    try {
        const income = await incomeService.getIncomeById(req.params.id);
        if (!income) return res.status(404).json({ success: false, message: "Income not found" });
        res.json({ success: true, data: income });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
  try {
    const deletedData = await incomeService.deleteIncome(req.params.id);
    if (!deletedData) return res.status(404).json({ success: false, message: "Income not found" });
    res.status(200).json({ success: true, message: "Income deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};