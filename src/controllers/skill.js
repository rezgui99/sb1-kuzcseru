const db = require("../../models");
const {
  Skill,
  SkillType,
  JobRequiredSkill,
  EmployeeSkill,
  JobEmployeeSkillMatch,
} = db;

// GET all skills
const findAllSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll({
      include: [
        { model: SkillType, as: "type" },
        // { model: JobRequiredSkill, as: "jobRequiredSkills" },
        // { model: EmployeeSkill, as: "employeeSkills" },
        // { model: JobEmployeeSkillMatch, as: "jobEmployeeSkillMatches" },
      ],
    });
    res.json(skills);
  } catch (err) {
    console.error("Erreur dans findAllSkills:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET skill by ID
const findSkillById = async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id, {
      include: [
        { model: SkillType, as: "type" },
        // { model: JobRequiredSkill, as: "jobRequiredSkills" },
        // { model: EmployeeSkill, as: "employeeSkills" },
        // { model: JobEmployeeSkillMatch, as: "jobEmployeeSkillMatches" },
      ],
    });
    if (!skill) return res.status(404).json({ message: "Compétence non trouvée" });
    res.json(skill);
  } catch (err) {
    console.error("Erreur dans findSkillById:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST create new skill
const createSkill = async (req, res) => {
  try {
    const { name, description, skill_type_id } = req.body;
    if (!name || !skill_type_id) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const skill = await Skill.create({ name, description, skill_type_id });

    const skillWithType = await Skill.findByPk(skill.id, {
      include: [{ model: SkillType, as: "type" }],
    });

    res.status(201).json(skillWithType);
  } catch (err) {
    console.error("Erreur dans createSkill:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT update skill
const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) return res.status(404).json({ message: "Compétence non trouvée" });

    const { name, description, skill_type_id } = req.body;

    await skill.update({ name, description, skill_type_id });

    // Recharge avec la relation "type"
    const updatedSkillWithType = await Skill.findByPk(skill.id, {
      include: [{ model: SkillType, as: "type" }],
    });

    res.json(updatedSkillWithType);
  } catch (err) {
    console.error("Erreur dans updateSkill:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE skill
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) return res.status(404).json({ message: "Compétence non trouvée" });

    await skill.destroy();
    res.json({ message: "Compétence supprimée avec succès" });
  } catch (err) {
    console.error("Erreur dans deleteSkill:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  findAllSkills,
  findSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
};
