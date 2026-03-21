const Expense = require('../models/Expense');

exports.getAllExpenses = async () => {
  return await Expense.find()
    .populate({
      path: 'CategoryData',
      select: 'CategoryName IsExpense IsIncome'
    })
    .populate({
      path: 'SubCategoryData',
      select: 'SubCategoryName'
    })
    .populate({
      path: 'PeopleData',
      select: 'PeopleName PeopleCode Email'
    })
    .populate({
      path: 'ProjectData',
      select: 'ProjectName'
    })
    .populate({
      path: 'UserData', // 👈 ADD THIS POPULATE
      select: 'UserName EmailAddress' // Select the fields you want from User
    })
    .sort({ ExpenseDate: -1 });
};

exports.createExpense = async (data) => {
  // Get the last expense to determine next ExpenseID
  const lastExpense = await Expense.findOne().sort({ ExpenseID: -1 });
  let nextExpenseID = 7001;

  if (lastExpense && lastExpense.ExpenseID) {
    nextExpenseID = lastExpense.ExpenseID + 1;
  }
  
  // Create new expense with auto-incremented ID
  const newExpense = new Expense({
    ...data,
    ExpenseID: nextExpenseID
  });
  
  return await newExpense.save();
};

exports.updateExpense = async (id, data) => {
  return await Expense.findOneAndUpdate({ ExpenseID: id }, data, { new: true });
};

exports.getExpenseById = async (id) => {
  return await Expense.findOne({ ExpenseID: id })
    .populate({
      path: 'CategoryData',
      select: 'CategoryName IsExpense IsIncome'
    })
    .populate({
      path: 'SubCategoryData',
      select: 'SubCategoryName'
    })
    .populate({
      path: 'PeopleData',
      select: 'PeopleName PeopleCode Email'
    })
    .populate({
      path: 'ProjectData',
      select: 'ProjectName'
    })
    .populate({
      path: 'UserData',
      select: 'UserName EmailAddress'
    });
};

exports.deleteExpense = async (id) => {
  return await Expense.findOneAndDelete({ ExpenseID: id });
};

exports.getExpensesByUserId = async (userId) => {
  return await Expense.find({ UserID: userId })
    .populate({
      path: 'CategoryData',
      select: 'CategoryName IsExpense IsIncome'
    })
    .populate({
      path: 'SubCategoryData',
      select: 'SubCategoryName'
    })
    .populate({
      path: 'PeopleData',
      select: 'PeopleName PeopleCode Email'
    })
    .populate({
      path: 'ProjectData',
      select: 'ProjectName'
    })
    .populate({
      path: 'UserData', // 👈 ADD THIS POPULATE
      select: 'UserName EmailAddress'
    })
    .sort({ ExpenseDate: -1 });
};