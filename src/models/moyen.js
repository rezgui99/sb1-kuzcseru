"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Moyen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Moyen.belongsToMany(models.JobDescription, {
        through: "JobDescriptionMoyens",
        foreignKey: "moyenId",
        otherKey: "jobDescriptionId",
        as: "jobDescriptions",
      });
    }
  }
  Moyen.init(
    {
      moyen: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Moyen",
      tableName: "Moyens",
    }
  );
  return Moyen;
};
