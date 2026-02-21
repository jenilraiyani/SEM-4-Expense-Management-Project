const Expense = require('../models/Expense');
const Income = require('../models/Income');

exports.getDashboardTotals = async () => {
  const expenseResult = await Expense.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$Amount" }
      }
    }
  ]);

  const incomeResult = await Income.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$Amount" }
      }
    }
  ]);

  const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
  const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;

  const balance = totalIncome - totalExpense;

  return { totalExpense, totalIncome, balance };
};