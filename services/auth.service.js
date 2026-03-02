const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (userData) => {  
  const existingUser = await User.findOne({ EmailAddress: userData.EmailAddress });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const lastUser = await User.findOne().sort({ UserID: -1 });
  
  // 3. Calculate the next UserID (Start at 101 if no users exist)
  let nextUserID = 101; 
  if (lastUser && lastUser.UserID) {
    nextUserID = lastUser.UserID + 1;
  }

  // 4. 👇 Generate a salt and Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.Password, salt);

  // 5. Create the new user with generated ID, Type, and Hashed Password
  const newUser = new User({
    ...userData,
    UserID: nextUserID,                   
    UserType: userData.UserType || 'user', 
    Password: hashedPassword              // 👇 Save the hashed password, NOT the original!
  });

  // 6. Save to database
  return await newUser.save();
};

exports.login = async (email, password) => {

  const user = await User.findOne({ EmailAddress: email });
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.Password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }


  const token = jwt.sign(
    { id: user.UserID, email: user.EmailAddress },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );


  const { Password, ...userWithoutPassword } = user.toObject();

  return { user: userWithoutPassword, token };
};