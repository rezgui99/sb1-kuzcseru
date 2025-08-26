"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.hasMany(models.EmployeeSkill, {
        foreignKey: "employee_id",
      });
      Employee.hasMany(models.JobEmployeeSkillMatch, {
        foreignKey: "employee_id",
      });
    }
  }

  Employee.init(
    {
      name: DataTypes.STRING,
      position: DataTypes.STRING,
      hire_date: DataTypes.DATE,
      email: DataTypes.STRING,           // Renommé depuis contact_info
      phone: DataTypes.STRING,           // Ajouté
      gender: DataTypes.STRING,          // Ajouté
      location: DataTypes.STRING,        // Ajouté
      notes: DataTypes.TEXT,             // Ajouté
    },
    {
      sequelize,
      modelName: "Employee",
      tableName: "Employees",
    }
  );

  return Employee;
};
