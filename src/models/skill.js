"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Skill extends Model {
    static associate(models) {
      Skill.belongsTo(models.SkillType, {
        foreignKey: "skill_type_id",
        as: "type",
      });

      Skill.hasMany(models.JobRequiredSkill, {
        foreignKey: "skill_id",
        as: "jobRequiredSkills",  // alias ajouté
      });

      Skill.hasMany(models.EmployeeSkill, {
        foreignKey: "skill_id",
        as: "employeeSkills",     // alias ajouté
      });

      Skill.hasMany(models.JobEmployeeSkillMatch, {
        foreignKey: "skill_id",
        as: "jobEmployeeSkillMatches", // alias ajouté
      });
    }
  }
  Skill.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      skill_type_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Skill",
      tableName: "Skills",
    }
  );
  return Skill;
};
