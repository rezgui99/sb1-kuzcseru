"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JobEmployeeSkillMatch extends Model {
    static associate(models) {
      JobEmployeeSkillMatch.belongsTo(models.JobDescription, {
        foreignKey: "job_description_id",
      });
      JobEmployeeSkillMatch.belongsTo(models.Employee, {
        foreignKey: "employee_id",
      });
      JobEmployeeSkillMatch.belongsTo(models.Skill, {
        foreignKey: "skill_id",
      });
    }
  }
  JobEmployeeSkillMatch.init(
    {
      job_description_id: DataTypes.INTEGER,
      employee_id: DataTypes.INTEGER,
      skill_id: DataTypes.INTEGER,
      required_skill_level_value: DataTypes.INTEGER,
      actual_skill_level_value: DataTypes.INTEGER,
      skill_match_score: DataTypes.INTEGER,
      calculated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "JobEmployeeSkillMatch",
      tableName: "JobEmployeeSkillMatches",
    }
  );
  return JobEmployeeSkillMatch;
};
