const { SkillType } = require("../../models/index");

// Récupérer tous les SkillTypes
async function findAllSkillTypes(req, res) {
  try {
    const types = await SkillType.findAll();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Récupérer un SkillType par ID
async function findSkillTypeById(req, res) {
  try {
    const type = await SkillType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ message: "Type de compétence non trouvé" });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Créer un nouveau SkillType
async function createSkillType(req, res) {
  try {
    const { type_name, description } = req.body;
    const newType = await SkillType.create({ type_name, description });
    res.status(201).json(newType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Mettre à jour un SkillType
async function updateSkillType(req, res) {
  try {
    const type = await SkillType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ message: "Type de compétence non trouvé" });

    const { type_name, description } = req.body;
    await type.update({ type_name, description });

    res.json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Supprimer un SkillType
async function deleteSkillType(req, res) {
  try {
    const type = await SkillType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ message: "Type de compétence non trouvé" });

    await type.destroy();
    res.json({ message: "Type de compétence supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  findAllSkillTypes,
  findSkillTypeById,
  createSkillType,
  updateSkillType,
  deleteSkillType,
};
