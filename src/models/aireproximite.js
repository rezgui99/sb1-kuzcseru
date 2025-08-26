"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AireProximite extends Model {
    static associate(models) {
      AireProximite.belongsToMany(models.JobDescription, {
        through: "JobDescriptionAiresProximites",
        foreignKey: "airesProximiteId",
        otherKey: "jobDescriptionId",
        as: "jobDescriptions",
      });
    }
  }
  AireProximite.init(
    {
      poste: DataTypes.STRING,
      nombre: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "AireProximite",
      tableName: "AireProximites",
    }
  );
  return AireProximite;
};
