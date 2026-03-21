const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  UserID: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  UserName: { 
    type: String, 
    required: true, 
    maxLength: 250 
  },
  EmailAddress: { 
    type: String, 
    required: true, 
    maxLength: 500,
    unique: true
  },
  Password: { 
    type: String, 
    required: true, 
    maxLength: 100
  },
  MobileNo: { 
    type: String, 
    required: true, 
    maxLength: 50 
  },
  ProfileImage: { 
    type: String, 
    maxLength: 500,
    default: null 
  },
  UserType: { 
    type: String, 
    enum: ['admin', 'user', 'manager'],
    default: 'user' 
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

module.exports = mongoose.model('User', UserSchema);