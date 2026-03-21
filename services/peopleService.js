const People = require('../models/People');

exports.getAllPeoples = async () => {
  return await People.find();
};

exports.createPeople = async (data) => {
  // Get the last people to determine next PeopleID
  const lastPeople = await People.findOne().sort({ PeopleID: -1 });
  let nextPeopleID = 201;

  if (lastPeople && lastPeople.PeopleID) {
    nextPeopleID = lastPeople.PeopleID + 1;
  }

  // Create new people with auto-incremented ID
  const newPeople = new People({
    ...data,
    PeopleID: nextPeopleID
  });
  return await newPeople.save();
};

exports.updatePeople = async (id, data) => {
  return await People.findOneAndUpdate({ PeopleID: id }, data, { new: true });
};

exports.getPeopleById = async (id) => {

  const result = await People.aggregate([
    { $match: { PeopleID: parseInt(id) } },
    {
      $lookup: {
        from: 'projects',
        localField: 'PeopleID',
        foreignField: 'PeopleID',
        as: 'AssignedProjects'
      }
    }
  ]);
  return result[0];
};

exports.deletePeople = async (id) => {
  return await People.findOneAndDelete({ PeopleID: id });
};
