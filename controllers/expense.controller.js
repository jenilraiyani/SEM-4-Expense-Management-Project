const expenseService = require('../services/expenseService');

exports.getAll = async (req, res) => {
  try {
    const data = await expenseService.getAllExpenses();
    res.status(200).json({ success: true, count: data.length, data: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await expenseService.createExpense(req.body);
    res.status(201).json({ success: true, data: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedData = await expenseService.updateExpense(req.params.id, req.body);
    if (!updatedData) return res.status(404).json({ success: false, message: "Expense not found" });
    res.status(200).json({ success: true, data: updatedData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getExpenseById = async (req, res) => {
    try {
        const expense = await expenseService.getExpenseById(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
        res.json({ success: true, data: expense });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
  try {
    const deletedData = await expenseService.deleteExpense(req.params.id);
    if (!deletedData) return res.status(404).json({ success: false, message: "Expense not found" });
    res.status(200).json({ success: true, message: "Expense deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};  