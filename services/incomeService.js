const Income = require('../models/Income');

exports.getAllIncomes = async () => {
  return await Income.find()
    .populate({
      path: 'PeopleData',
      select: 'PeopleName'
    })
    .populate({
      path: 'UserData', // 👈 ADD THIS POPULATE
      select: 'UserName EmailAddress' // Select the fields you want from User
    })
    .populate({
      path: 'CategoryData',
      select: 'CategoryName IsExpense IsIncome'
    })
    .sort({ IncomeDate: -1 });
};

exports.createIncome = async (data) => {
  // Get the last income to determine next IncomeID
  const lastIncome = await Income.findOne().sort({ IncomeID: -1 });
  let nextIncomeID = 6001;

  if (lastIncome && lastIncome.IncomeID) {
    nextIncomeID = lastIncome.IncomeID + 1;
  }

  // Create new income with auto-incremented ID
  const newIncome = new Income({
    ...data,
    IncomeID: nextIncomeID
  });

  return await newIncome.save();
};

exports.updateIncome = async (id, data) => {
  return await Income.findOneAndUpdate({ IncomeID: id }, data, { new: true });
};

exports.getIncomeById = async (id) => {
  return await Income.findOne({ IncomeID: id })
    .populate({
      path: 'PeopleData',
      select: 'PeopleName'
    })
    .populate({
      path: 'UserData',
      select: 'UserName EmailAddress'
    })
    .populate({
      path: 'CategoryData',
      select: 'CategoryName IsExpense IsIncome'
    });
};

exports.deleteIncome = async (id) => {
  return await Income.findOneAndDelete({ IncomeID: id });
};

exports.getIncomesByUserId = async (userId) => {
  return await Income.find({ UserID: userId })
    .populate({
      path: 'PeopleData',
      select: 'PeopleName'
    })
    .populate({
      path: 'UserData', // 👈 ADD THIS POPULATE
      select: 'UserName EmailAddress'
    })
    .populate({
      path: 'CategoryData',
      select: 'CategoryName IsExpense IsIncome'
    })
    .sort({ IncomeDate: -1 });
};