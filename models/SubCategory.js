const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
  SubCategoryID: {
    type: Number,
    required: true,
    unique: true
  },
  CategoryID: {
    type: Number,
    required: true
  },
  SubCategoryName: {
    type: String,
    required: true,
    maxLength: 250
  },
  LogoPath: {
    type: String,
    maxLength: 250,
    default: null
  },
  IsExpense: {
    type: Boolean,
    required: true
  },
  IsIncome: {
    type: Boolean,
    required: true
  },
  IsActive: {
    type: Boolean,
    required: true,
    default: true
  },
  Description: {
    type: String,
    maxLength: 500,
    default: null
  },
  UserID: {
    type: Number,
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
  Sequence: {
    type: Number,
    default: null
  }
}, {
  
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


SubCategorySchema.virtual('CategoryData', {
  ref: 'Category',          
  localField: 'CategoryID', 
  foreignField: 'CategoryID',
  justOne: true             
});

module.exports = mongoose.model('sub_categories', SubCategorySchema);