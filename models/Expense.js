const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  ExpenseID: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  ExpenseDate: { 
    type: Date, 
    required: true 
  },
  CategoryID: { 
    type: Number,
    ref: 'Category', // 👈 Add reference to Category model
    default: null 
  },
  SubCategoryID: { 
    type: Number,
    ref: 'sub_categories', // 👈 Add reference to SubCategory model
    default: null 
  },
  PeopleID: { 
    type: Number, 
    ref: 'People', // 👈 Add reference to People model
    required: true 
  },
  ProjectID: { 
    type: Number,
    ref: 'Project', // 👈 Add reference to Project model
    default: null 
  },
  Amount: { 
    type: Number, 
    required: true 
  },
  ExpenseDetail: { 
    type: String, 
    maxLength: 500,
    default: null 
  },
  AttachmentPath: { 
    type: String, 
    maxLength: 250,
    default: null 
  },
  Description: { 
    type: String, 
    maxLength: 500,
    default: null 
  },
  UserID: { 
    type: Number,
    ref:'User', 
    required: true 
  },
  Created: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  Modified: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  Status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 👇 Add virtual for Category data
ExpenseSchema.virtual('CategoryData', {
  ref: 'Category',
  localField: 'CategoryID',
  foreignField: 'CategoryID',
  justOne: true
});

// 👇 Add virtual for SubCategory data
ExpenseSchema.virtual('SubCategoryData', {
  ref: 'sub_categories',
  localField: 'SubCategoryID',
  foreignField: 'SubCategoryID',
  justOne: true
});

// 👇 Add virtual for People data
ExpenseSchema.virtual('PeopleData', {
  ref: 'People',
  localField: 'PeopleID',
  foreignField: 'PeopleID',
  justOne: true
});

// 👇 Add virtual for Project data
ExpenseSchema.virtual('ProjectData', {
  ref: 'Project',
  localField: 'ProjectID',
  foreignField: 'ProjectID',
  justOne: true
});


// 👈 ADD VIRTUAL FOR USER DATA
ExpenseSchema.virtual('UserData', {
  ref: 'User',
  localField: 'UserID',
  foreignField: 'UserID',
  justOne: true
});

module.exports = mongoose.model('Expense', ExpenseSchema);