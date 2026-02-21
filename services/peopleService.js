const People = require('../models/People');

exports.getAllPeoples = async () => {
  return await People.find();
};

exports.createPeople = async (data) => {
  const newPeople = new People(data);
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
