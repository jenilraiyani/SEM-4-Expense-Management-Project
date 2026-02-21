const Project = require('../models/Project');

exports.getAllProjects = async () => {
  
  return await Project.find().populate('TeamMembers');
};

exports.createProject = async (data) => {
  const newProject = new Project(data);
  return await newProject.save();
};

exports.updateProject = async (id, data) => {
  return await Project.findOneAndUpdate({ ProjectID: id }, data, { new: true });
};

exports.getProjectById = async (id) => {
    return await Project.findOne({ ProjectID: id }).populate('TeamMembers');
};

exports.deleteProject = async (id) => {
  return await Project.findOneAndDelete({ ProjectID: id });
};