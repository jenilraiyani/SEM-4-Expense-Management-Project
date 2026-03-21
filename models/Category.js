const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  CategoryID: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  CategoryName: { 
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
    required: true, 
    type: Date, 
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
});


module.exports = mongoose.model('Category', CategorySchema);