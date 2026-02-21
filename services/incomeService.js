const Income = require('../models/Income');

exports.getAllIncomes = async () => {
  return await Income.find()
    .populate('CategoryID', 'CategoryName')
    .populate('PeopleID', 'PeopleName');
};

exports.createIncome = async (data) => {
  const newIncome = new Income(data);
  return await newIncome.save();
};

exports.updateIncome = async (id, data) => {
  return await Income.findOneAndUpdate({ IncomeID: id }, data, { new: true });
};

exports.getIncomeById = async (id) => {
    return await Income.findOne({ IncomeID: id });
};

exports.deleteIncome = async (id) => {
  return await Income.findOneAndDelete({ IncomeID: id });
};