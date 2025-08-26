const db = require("../../models/index");
const { JobRequiredSkill, JobDescription, Skill, SkillLevel } = db;

// GET all job required skills
const findAllJobRequiredSkills = async (req, res) => {
  try {
    const data = await JobRequiredSkill.findAll({
      include: [
        { model: JobDescription, attributes: ["id", "emploi"] },
        { model: Skill, attributes: ["id", "name"] },
        { model: SkillLevel, attributes: ["id", "level_name", "value"] },
      ],
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET one job required skill
const findJobRequiredSkill = async (req, res) => {
  try {
    const { job_description_id, skill_id } = req.params;
    const data = await JobRequiredSkill.findOne({
      where: { job_description_id, skill_id },
      include: [
        { model: JobDescription, attributes: ["id", "emploi"] },
        { model: Skill, attributes: ["id", "name"] },
        { model: SkillLevel, attributes: ["id", "level_name", "value"] },
      ],
    });

    if (!data) {
      return res.status(404).json({ message: "Compétence requise pour la fiche de poste non trouvée" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create new job required skill
const createJobRequiredSkill = async (req, res) => {
  try {
    const { job_description_id, skill_id, required_skill_level_id } = req.body;

    const exists = await JobRequiredSkill.findOne({
      where: { job_description_id, skill_id },
    });

    if (exists) {
      return res
        .status(409)
        .json({ message: "La compétence requise pour cette fiche de poste existe déjà" });
    }

    const newEntry = await JobRequiredSkill.create({
      job_description_id,
      skill_id,
      required_skill_level_id,
    });

    // Fetch the new entry with relations
    const data = await JobRequiredSkill.findOne({
      where: { job_description_id, skill_id },
      include: [
        { model: JobDescription, attributes: ["id", "emploi"] },
        { model: Skill, attributes: ["id", "name"] },
        { model: SkillLevel, attributes: ["id", "level_name", "value"] },
      ],
    });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update job required skill
const updateJobRequiredSkill = async (req, res) => {
  try {
    const { job_description_id, skill_id } = req.params;
    const { required_skill_level_id } = req.body;

    const entry = await JobRequiredSkill.findOne({
      where: { job_description_id, skill_id },
    });

    if (!entry) {
      return res.status(404).json({ message: "Compétence requise pour la fiche de poste non trouvée" });
    }

    await entry.update({ required_skill_level_id });

    // Fetch updated entry with details
    const updated = await JobRequiredSkill.findOne({
      where: { job_description_id, skill_id },
      include: [
        { model: JobDescription, attributes: ["id", "emploi"] },
        { model: Skill, attributes: ["id", "name"] },
        { model: SkillLevel, attributes: ["id", "level_name", "value"] },
      ],
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE job required skill
const deleteJobRequiredSkill = async (req, res) => {
  try {
    const { job_description_id, skill_id } = req.params;

    const entry = await JobRequiredSkill.findOne({
      where: { job_description_id, skill_id },
    });

    if (!entry) {
      return res
        .status(404)
        .json({ message: "La compétence requise pour cette fiche de poste n'existe pas" });
    }

    await entry.destroy();
    res.json({ message: "Compétence requise pour la fiche de poste supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  findAllJobRequiredSkills,
  findJobRequiredSkill,
  createJobRequiredSkill,
  updateJobRequiredSkill,
  deleteJobRequiredSkill,
};
