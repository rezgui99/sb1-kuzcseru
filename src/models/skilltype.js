"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SkillType extends Model {
    static associate(models) {
      SkillType.hasMany(models.Skill, {
        foreignKey: "skill_type_id",
        as: "skills",
      });
    }
  }
  SkillType.init(
    {
      type_name: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "SkillType",
      tableName: "SkillTypes",
    }
  );
  return SkillType;
};
