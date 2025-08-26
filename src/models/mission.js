"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Mission extends Model {

    static associate(models) {
      Mission.belongsToMany(models.JobDescription, {
        through: "JobDescriptionMissions",
        foreignKey: "missionId",
        otherKey: "jobDescriptionId",
        as: "jobDescriptions",
      });
    }
  }
  Mission.init(
    {
      mission: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Mission",
      tableName: "Missions",
    }
  );
  return Mission;
};
