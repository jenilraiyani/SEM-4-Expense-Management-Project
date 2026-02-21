const Expense = require('../models/Expense');

exports.getAllExpenses = async () => {
  return await Expense.find();
};

exports.createExpense = async (data) => {
  const newExpense = new Expense(data);
  return await newExpense.save();
};

exports.updateExpense = async (id, data) => {
  return await Expense.findOneAndUpdate({ ExpenseID: id }, data, { new: true });
};

exports.getExpenseById = async (id) => {
    return await Expense.findOne({ ExpenseID: id });
};

exports.deleteExpense = async (id) => {
  return await Expense.findOneAndDelete({ ExpenseID: id });
};