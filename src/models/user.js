"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here if needed
    }

    // Instance method to check password
    async checkPassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    // Instance method to get user without password
    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.password;
      delete values.resetPasswordToken;
      delete values.resetPasswordExpires;
      return values;
    }
  }

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50]
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50]
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 100]
        }
      },
      role: {
        type: DataTypes.ENUM('admin', 'hr', 'employee'),
        defaultValue: 'employee'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      lastLogin: {
        type: DataTypes.DATE
      },
      resetPasswordToken: {
        type: DataTypes.STRING
      },
      resetPasswordExpires: {
        type: DataTypes.DATE
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      emailVerificationToken: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      }
    }
  );

  return User;
};