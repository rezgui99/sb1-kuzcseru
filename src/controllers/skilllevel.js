const db = require("../../models/index");
const { SkillLevel, JobRequiredSkill, EmployeeSkill } = db;

// GET all skill levels
const findAllSkillLevels = async (req, res) => {
  try {
    const levels = await SkillLevel.findAll({
      include: [
        { model: JobRequiredSkill, as: "JobRequiredSkills" },
        { model: EmployeeSkill, as: "EmployeeSkills" },
      ],
    });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET skill level by ID
const findSkillLevelById = async (req, res) => {
  try {
    const level = await SkillLevel.findByPk(req.params.id, {
      include: [
        { model: JobRequiredSkill, as: "JobRequiredSkills" },
        { model: EmployeeSkill, as: "EmployeeSkills" },
      ],
    });
    if (!level) return res.status(404).json({ message: "Niveau de compétence non trouvé" });
    res.json(level);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create new skill level
const createSkillLevel = async (req, res) => {
  try {
    const { level_name, description, value } = req.body;
    if (!level_name || value == null) {
      return res.status(400).json({ message: "Niveau et valeur sont requis" });
    }

    const exists = await SkillLevel.findOne({ where: { level_name } });
    if (exists) return res.status(409).json({ message: "Le niveau de compétence existe déjà" });

    const skillLevel = await SkillLevel.create({ level_name, description, value });
    res.status(201).json(skillLevel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update skill level
const updateSkillLevel = async (req, res) => {
  try {
    const { level_name, description, value } = req.body;
    const level = await SkillLevel.findByPk(req.params.id);
    if (!level) return res.status(404).json({ message: "Niveau de compétence non trouvé" });

    await level.update({ level_name, description, value });
    res.json(level);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE skill level
const deleteSkillLevel = async (req, res) => {
  try {
    const level = await SkillLevel.findByPk(req.params.id);
    if (!level) return res.status(404).json({ message: "Niveau de compétence non trouvé" });

    await level.destroy();
    res.json({ message: "Niveau de compétence supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  findAllSkillLevels,
  findSkillLevelById,
  createSkillLevel,
  updateSkillLevel,
  deleteSkillLevel,
};
