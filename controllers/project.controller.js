const projectService = require('../services/projectService');

exports.getAll = async (req, res) => {
  try {
    const data = await projectService.getAllProjects();
    res.status(200).json({ success: true, count: data.length, data: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await projectService.createProject(req.body);
    res.status(201).json({ success: true, data: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedData = await projectService.updateProject(req.params.id, req.body);
    if (!updatedData) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, data: updatedData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        res.json({ success: true, data: project });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
  try {
    const deletedData = await projectService.deleteProject(req.params.id);
    if (!deletedData) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ... existing project controller functions ...

// 👇 ADD THIS NEW CONTROLLER FUNCTION 👇
exports.getProjectsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await projectService.getProjectsByUserId(userId);
    
    if (!data || data.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "No projects found for this user", 
        data: [] 
      });
    }

    res.status(200).json({ 
      success: true, 
      count: data.length, 
      data: data 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};