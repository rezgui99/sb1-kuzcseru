"use strict";

const db = require("../../models/index");
const { Moyen, sequelize } = db;

const getAllMoyens = async (req, res) => {
  try {
    const moyens = await Moyen.findAll();
    res.json(moyens);
  } catch (error) {
    console.error("Erreur getAll:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getMoyenById = async (req, res) => {
  try {
    const moyen = await Moyen.findByPk(req.params.id);
    if (!moyen) return res.status(404).json({ message: "Moyen non trouvé" });
    res.json(moyen);
  } catch (error) {
    console.error("Erreur getById:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const createMoyen = async (req, res) => {
  const t = await sequelize.transaction(); // ➕ démarrage transaction
  try {
    const { moyen } = req.body;
    if (!moyen) {
      await t.rollback();
      return res.status(400).json({ message: 'Le champ "moyen" est requis' });
    }

    const newMoyen = await Moyen.create({ moyen }, { transaction: t });

    await t.commit(); // ✅ commit si tout OK
    res.status(201).json(newMoyen);
  } catch (error) {
    await t.rollback(); // ❌ rollback si erreur
    console.error("Erreur create:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const updateMoyen = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { moyen } = req.body;
    const existing = await Moyen.findByPk(req.params.id, { transaction: t });

    if (!existing) {
      await t.rollback();
      return res.status(404).json({ message: "Moyen non trouvé" });
    }

    await existing.update({ moyen }, { transaction: t });

    await t.commit();
    res.json(existing);
  } catch (error) {
    await t.rollback();
    console.error("Erreur update:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const deleteMoyen = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const existing = await Moyen.findByPk(req.params.id, { transaction: t });

    if (!existing) {
      await t.rollback();
      return res.status(404).json({ message: "Moyen non trouvé" });
    }

    await existing.destroy({ transaction: t });

    await t.commit();
    res.status(204).send();
  } catch (error) {
    await t.rollback();
    console.error("Erreur delete:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getAllMoyens,
  getMoyenById,
  createMoyen,
  updateMoyen,
  deleteMoyen,
};
