const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  IncomeID: {
    type: Number,
    required: true,
    unique: true
  },
  IncomeDate: {
    type: Date,
    required: true
  },
  CategoryID: {
    type: Number,
    ref:'Category',
    default: null
  },
  SubCategoryID: {
    type: Number,
    default: null
  },
  PeopleID: {
    type: Number,
    required: true
  },
  ProjectID: {
    type: Number,
    default: null
  },
  Amount: {
    type: Number,
    required: true
  },
  IncomeDetail: {
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
    ref: 'User', // 👈 ADD THIS REFERENCE
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

// 👈 ADD VIRTUAL FOR USER DATA
IncomeSchema.virtual('UserData', {
  ref: 'User',
  localField: 'UserID',
  foreignField: 'UserID',
  justOne: true
});

// Keep existing People virtual
IncomeSchema.virtual('PeopleData', {
  ref: 'People',
  localField: 'PeopleID',
  foreignField: 'PeopleID',
  justOne: true
});

// 👇 Add virtual for Category data
IncomeSchema.virtual('CategoryData', {
  ref: 'Category',
  localField: 'CategoryID',
  foreignField: 'CategoryID',
  justOne: true
});

module.exports = mongoose.model('Income', IncomeSchema);