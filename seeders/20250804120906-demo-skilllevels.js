"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("SkillLevels", [
      {
        level_name: "Débutant",
        description: "Découvre le domaine, nécessite un accompagnement constant.",
        value: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        level_name: "Junior",
        description: "Connaissance de base, nécessite un encadrement.",
        value: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        level_name: "Autonome",
        description: "Peut travailler de manière autonome sur la majorité des tâches.",
        value: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        level_name: "Avancé",
        description: "Très compétent, capable de gérer des tâches complexes et de guider d'autres.",
        value: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        level_name: "Expert",
        description: "Expert dans le domaine, peut former et définir les meilleures pratiques.",
        value: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("SkillLevels", null, {});
  },
};
