const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User, sequelize } = require('../models');
const { generateToken } = require('../middleware/auth');

// Email configuration (configure with your email service)
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Register new user
const register = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      await t.rollback();
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Tous les champs sont obligatoires'
      });
    }

    if (password !== confirmPassword) {
      await t.rollback();
      return res.status(400).json({
        error: 'Passwords do not match',
        message: 'Les mots de passe ne correspondent pas'
      });
    }

    if (password.length < 6) {
      await t.rollback();
      return res.status(400).json({
        error: 'Password too short',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email }, transaction: t });
    if (existingUser) {
      await t.rollback();
      return res.status(409).json({
        error: 'User already exists',
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      emailVerificationToken: crypto.randomBytes(32).toString('hex')
    }, { transaction: t });

    // Generate token
    const token = generateToken(user.id);

    // Send welcome email (optional)
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@matchnhire.com',
        to: email,
        subject: 'Bienvenue sur MatchnHire',
        html: `
          <h1>Bienvenue ${firstName} ${lastName}!</h1>
          <p>Votre compte a été créé avec succès.</p>
          <p>Vous pouvez maintenant vous connecter à votre espace.</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }

    await t.commit();

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    await t.rollback();
    console.error('Registration error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Données invalides',
        details: error.errors.map(err => err.message)
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: 'Erreur lors de la création du compte'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email et mot de passe requis'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Votre compte a été désactivé'
      });
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Connexion réussie',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Erreur lors de la connexion'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id, { transaction: t });

    // Update basic info
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    
    // Update email if changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        where: { email },
        transaction: t 
      });
      
      if (existingUser && existingUser.id !== user.id) {
        await t.rollback();
        return res.status(409).json({
          error: 'Email already exists',
          message: 'Cet email est déjà utilisé'
        });
      }
      
      user.email = email;
      user.emailVerified = false; // Reset verification if email changed
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        await t.rollback();
        return res.status(400).json({
          error: 'Current password required',
          message: 'Mot de passe actuel requis'
        });
      }

      const isCurrentPasswordValid = await user.checkPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        await t.rollback();
        return res.status(400).json({
          error: 'Invalid current password',
          message: 'Mot de passe actuel incorrect'
        });
      }

      if (newPassword.length < 6) {
        await t.rollback();
        return res.status(400).json({
          error: 'Password too short',
          message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
        });
      }

      user.password = newPassword;
    }

    await user.save({ transaction: t });
    await t.commit();

    res.json({
      message: 'Profil mis à jour avec succès',
      user: user.toJSON()
    });

  } catch (error) {
    await t.rollback();
    console.error('Update profile error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Données invalides',
        details: error.errors.map(err => err.message)
      });
    }

    res.status(500).json({
      error: 'Profile update failed',
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { email } = req.body;

    if (!email) {
      await t.rollback();
      return res.status(400).json({
        error: 'Email required',
        message: 'Email requis'
      });
    }

    const user = await User.findOne({ where: { email }, transaction: t });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpires
    }, { transaction: t });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@matchnhire.com',
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <h1>Réinitialisation de mot de passe</h1>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Réinitialiser mon mot de passe
          </a>
          <p>Ce lien expire dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        `
      });
    } catch (emailError) {
      console.error('Reset email sending failed:', emailError);
      await t.rollback();
      return res.status(500).json({
        error: 'Email sending failed',
        message: 'Erreur lors de l\'envoi de l\'email'
      });
    }

    await t.commit();

    res.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });

  } catch (error) {
    await t.rollback();
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Forgot password failed',
      message: 'Erreur lors de la demande de réinitialisation'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      await t.rollback();
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Tous les champs sont requis'
      });
    }

    if (newPassword !== confirmPassword) {
      await t.rollback();
      return res.status(400).json({
        error: 'Passwords do not match',
        message: 'Les mots de passe ne correspondent pas'
      });
    }

    if (newPassword.length < 6) {
      await t.rollback();
      return res.status(400).json({
        error: 'Password too short',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      },
      transaction: t
    });

    if (!user) {
      await t.rollback();
      return res.status(400).json({
        error: 'Invalid or expired token',
        message: 'Token invalide ou expiré'
      });
    }

    // Update password and clear reset token
    await user.update({
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }, { transaction: t });

    await t.commit();

    res.json({
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    await t.rollback();
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      message: 'Erreur lors de la réinitialisation du mot de passe'
    });
  }
};

// Logout (client-side token removal, but we can track it server-side if needed)
const logout = async (req, res) => {
  try {
    // In a more advanced implementation, you might want to blacklist the token
    // For now, we just send a success response
    res.json({
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Erreur lors de la déconnexion'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  logout
};