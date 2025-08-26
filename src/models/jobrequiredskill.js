"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JobRequiredSkill extends Model {
    static associate(models) {
      JobRequiredSkill.belongsTo(models.JobDescription, {
        foreignKey: "job_description_id",
      });
      JobRequiredSkill.belongsTo(models.Skill, {
        foreignKey: "skill_id",
      });
      JobRequiredSkill.belongsTo(models.SkillLevel, {
        foreignKey: "required_skill_level_id",
      });
    }
  }
  JobRequiredSkill.init(
    {
         job_description_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      skill_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      required_skill_level_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "JobRequiredSkill",
      tableName: "JobRequiredSkills",
    }
  );
  return JobRequiredSkill;
};
