const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token invalide ou utilisateur inactif'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Votre session a expiré, veuillez vous reconnecter'
      });
    }
    
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'Token invalide'
    });
  }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: 'Permissions insuffisantes pour cette action'
      });
    }

    next();
  };
};

module.exports = {
  generateToken,
  authenticateToken,
  authorizeRoles
};