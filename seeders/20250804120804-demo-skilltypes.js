"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("SkillTypes", [
      {
      type_name: "Savoir",
      description: "Connaissances théoriques ou techniques nécessaires pour exercer un métier ou une fonction.",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
      type_name: "Savoir faire",
      description: "Capacité à mettre en pratique ses connaissances, à appliquer des méthodes et à utiliser des outils.",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
      type_name: "Savoir être",
      description: "Qualités personnelles et comportementales, telles que l'attitude, la communication et l'adaptabilité.",
      createdAt: new Date(),
      updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("SkillTypes", null, {});
  },
};
