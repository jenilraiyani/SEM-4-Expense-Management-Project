const Project = require('../models/Project');

exports.getAllProjects = async () => {

  return await Project.find().populate('TeamMembers');
};

exports.createProject = async (data) => {
  // Get the last project to determine next ProjectID
  const lastProject = await Project.findOne().sort({ ProjectID: -1 });
  let nextProjectID = 901;

  if (lastProject && lastProject.ProjectID) {
    nextProjectID = lastProject.ProjectID + 1;
  }

  // Create new project with auto-incremented ID
  const newProject = new Project({
    ...data,
    ProjectID: nextProjectID
  });
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

exports.getProjectsByUserId = async (userId) => {
  return await Project.find({ UserID: userId }).populate('TeamMembers');
};