const User = require('../models/User');

exports.getAllUsers = async () => {
  return await User.find();
};

exports.createUser = async (data) => {
  const newUser = new User(data);
  return await newUser.save();
};

exports.updateUser = async (id, data) => {
  return await User.findOneAndUpdate({ UserID: id }, data, { new: true });
};

exports.getUserById = async (id) => {
    return await User.findOne({ UserID: id }).select('-Password');
};

exports.deleteUser = async (id) => {
  return await User.findOneAndDelete({ UserID: id });
};