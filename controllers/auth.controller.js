const authService = require('../services/auth.service');

exports.register = async (req, res) => {
  try {    

    const user = await authService.register(req.body);
    res.status(201).json({ success: true, message: "User registered", data: user });
  } catch (err) {
    
    if (err.name === 'ValidationError') {
      console.error("VALIDATION FAILED ON:");
      
      for (let field in err.errors) {
        console.error(`${field}: ${err.errors[field].message}`);
      }
    } else {
      console.error("SERVER ERROR:", err.message);
    }
    
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { EmailAddress, Password } = req.body;
    const result = await authService.login(EmailAddress, Password);
    
    res.status(200).json({ 
      success: true, 
      message: "Login successful", 
      token: result.token, 
      user: result.user 
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

