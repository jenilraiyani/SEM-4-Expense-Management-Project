const mongoose = require('mongoose');

const PeopleSchema = new mongoose.Schema({
  PeopleID: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  PeopleCode: { 
    type: String, 
    maxLength: 50,
    default: null
  },
  PeopleName: { 
    type: String, 
    required: true, 
    maxLength: 250 
  },
  Email: { 
    type: String, 
    required: true, 
    maxLength: 150 
  },
  MobileNo: { 
    type: String, 
    required: true, 
    maxLength: 50 
  },
  Description: { 
    type: String, 
    maxLength: 500,
    default: null
  },
  UserID: { 
    type: Number, 
    ref: 'User',
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
  IsActive: { 
    type: Boolean, 
    default: true 
  },

});

module.exports = mongoose.model('People', PeopleSchema);