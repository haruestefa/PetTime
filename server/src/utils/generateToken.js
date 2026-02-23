const jwt = require('jsonwebtoken');

const generateToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = { generateToken };
