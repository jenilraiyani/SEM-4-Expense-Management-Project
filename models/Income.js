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
  }
});

module.exports = mongoose.model('Income', IncomeSchema);