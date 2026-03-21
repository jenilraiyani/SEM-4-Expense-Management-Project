const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  
  if (!tokenHeader) {
    return res.status(403).json({ success: false, message: "No token provided" });
  }

  
  const token = tokenHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ success: false, message: "Malformed token" });
  }

  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid Token" });
    }
    
    
    req.userId = decoded.id;
    next();
  });
};

module.exports = verifyToken;