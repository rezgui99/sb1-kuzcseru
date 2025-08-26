"use strict";

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[env];

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect || "postgres",
    // logging: false,
  }
);

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file !== basename && file.endsWith(".js") && !file.endsWith(".test.js")
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.values(db).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
