"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmployeeSkill extends Model {
    static associate(models) {
      EmployeeSkill.belongsTo(models.Employee, {
        foreignKey: "employee_id",
      });
      EmployeeSkill.belongsTo(models.Skill, {
        foreignKey: "skill_id",
      });
      EmployeeSkill.belongsTo(models.SkillLevel, {
        foreignKey: "actual_skill_level_id",
      });
    }
  }
  EmployeeSkill.init(
    {
      employee_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    skill_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
      actual_skill_level_id: DataTypes.INTEGER,
      acquired_date: DataTypes.DATE,
      certification: DataTypes.STRING,
      last_evaluated_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "EmployeeSkill",
      tableName: "EmployeeSkills",
    }
  );
  return EmployeeSkill;
};
