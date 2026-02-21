const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  ProjectID: {
    type: Number,
    required: true,
    unique: true
  },
  ProjectName: {
    type: String,
    required: true,
    maxLength: 250
  },
  ProjectLogo: {
    type: String,
    maxLength: 250,
    default: null
  },
  ProjectStartDate: {
    type: Date,
    default: null
  },
  ProjectEndDate: {
    type: Date,
    default: null
  },
  ProjectDetail: {
    type: String,
    maxLength: 500,
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
  PeopleID: [{ 
    type: Number, 
    default: [] 
  }]
  ,
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
  }
},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ProjectSchema.virtual('TeamMembers', {
  ref: 'People',           
  localField: 'PeopleID',  
  foreignField: 'PeopleID',
  justOne: false           
});

module.exports = mongoose.model('Project', ProjectSchema);