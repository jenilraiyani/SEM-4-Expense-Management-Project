const User = require('../models/User');

exports.getAllUsers = async () => {
  return await User.find();
};

exports.createUser = async (data) => {
  // Get the last user to determine next UserID
  const lastUser = await User.findOne().sort({ UserID: -1 });
  let nextUserID = 101;

  if (lastUser && lastUser.UserID) {
    nextUserID = lastUser.UserID + 1;
  }

  // Create new user with auto-incremented ID
  const newUser = new User({
    ...data,
    UserID: nextUserID
  });
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