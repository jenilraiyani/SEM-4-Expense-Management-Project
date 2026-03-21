const peopleService = require('../services/peopleService');

exports.getAll = async (req, res) => {
  try {
    const data = await peopleService.getAllPeoples();
    res.status(200).json({ success: true, count: data.length, data: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await peopleService.createPeople(req.body);
    res.status(201).json({ success: true, data: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedData = await peopleService.updatePeople(req.params.id, req.body);
    if (!updatedData) return res.status(404).json({ success: false, message: "People not found" });
    res.status(200).json({ success: true, data: updatedData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getPeopleById = async (req, res) => {
    try {
        const person = await peopleService.getPeopleById(req.params.id);
        if (!person) return res.status(404).json({ success: false, message: "Person not found" });
        res.json({ success: true, data: person });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
  try {
    const deletedData = await peopleService.deletePeople(req.params.id);
    if (!deletedData) return res.status(404).json({ success: false, message: "People not found" });
    res.status(200).json({ success: true, message: "People deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};