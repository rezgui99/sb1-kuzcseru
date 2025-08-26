"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JobDescription extends Model {
    static associate(models) {
      JobDescription.belongsToMany(models.Mission, {
        through: "JobDescriptionMissions",
        foreignKey: "jobDescriptionId",
        otherKey: "missionId",
        as: "missions",
      });

      JobDescription.belongsToMany(models.Moyen, {
        through: "JobDescriptionMoyens",
        foreignKey: "jobDescriptionId",
        otherKey: "moyenId",
        as: "moyens",
      });

      JobDescription.belongsToMany(models.AireProximite, {
        through: "JobDescriptionAiresProximites",
        foreignKey: "jobDescriptionId",
        otherKey: "airesProximiteId",
        as: "aireProximites",
      });

      JobDescription.belongsTo(models.JobDescription, {
        as: "superieurN1",
        foreignKey: "superieur_n1",
      });

      JobDescription.belongsTo(models.JobDescription, {
        as: "superieurN2",
        foreignKey: "superieur_n2",
      });

      JobDescription.hasMany(models.JobDescription, {
        as: "subordonnesN1",
        foreignKey: "superieur_n1",
      });

      JobDescription.hasMany(models.JobDescription, {
        as: "subordonnesN2",
        foreignKey: "superieur_n2",
      });
      JobDescription.hasMany(models.JobRequiredSkill, {
        as: "requiredSkills",
        foreignKey: "job_description_id",
      });
      JobDescription.hasMany(models.JobEmployeeSkillMatch, {
        as: "skillsMatch",
        foreignKey: "job_description_id",
      });
    }
  }
  JobDescription.init(
    {
      emploi: DataTypes.STRING,
      filiere_activite: DataTypes.STRING,
      famille: DataTypes.STRING,
      superieur_n1: DataTypes.INTEGER,
      superieur_n2: DataTypes.INTEGER,
      finalite: DataTypes.TEXT,
      niveau_exigence: DataTypes.STRING,
      niveau_exp: DataTypes.STRING,
      status: DataTypes.STRING,
      version: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "JobDescription",
      tableName: "JobDescriptions",
    }
  );
  return JobDescription;
};
