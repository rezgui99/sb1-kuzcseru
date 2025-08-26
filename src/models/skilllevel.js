"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SkillLevel extends Model {
    static associate(models) {
      SkillLevel.hasMany(models.JobRequiredSkill, {
        foreignKey: "required_skill_level_id",
      });
      SkillLevel.hasMany(models.EmployeeSkill, {
        foreignKey: "actual_skill_level_id",
      });
    }
  }
  SkillLevel.init(
    {
      level_name: DataTypes.STRING,
      description: DataTypes.TEXT,
      value: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "SkillLevel",
      tableName: "SkillLevels",
    }
  );
  return SkillLevel;
};
