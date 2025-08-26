const db = require("../../models/index");
const {
  JobDescription,
  Mission,
  Skill,
  SkillType,
  SkillLevel,
  Moyen,
  AireProximite,
  JobRequiredSkill,
  sequelize,
} = db;

async function syncCreateJobDescription({
  job,
  items,
  model,
  setMethod,
  transaction,
  uniqueKey = "id",
}) {
  await job[setMethod]([], { transaction });

  const newItems = [];

  for (const item of items) {
    let instance;

    if (item[uniqueKey]) {
      instance = await model.findByPk(item[uniqueKey], { transaction });

      if (instance) {
        await instance.update(item, { transaction });
      } else {
        instance = await model.create(item, { transaction });
      }
    } else {
      instance = await model.create(item, { transaction });
    }

    newItems.push(instance);
  }

  await job[setMethod](newItems, { transaction });
}
async function SyncUpdateJobDescription({
  job,
  items,
  model,
  relationName, // "missions", "moyens"...
  setMethod, // "setMissions", ...
  transaction,
  uniqueKey = "id",
}) {
  const existingItems = await job[`get${capitalize(relationName)}`]({
    transaction,
  });

  const existingMap = new Map(
    existingItems.map((item) => [item[uniqueKey], item])
  );
  const receivedItemIds = new Set();

  const itemsToKeep = [];
  const itemsToAdd = [];

  for (const item of items) {
    const itemId = item[uniqueKey];

    if (itemId && existingMap.has(itemId)) {
      const existing = existingMap.get(itemId);
      await existing.update(item, { transaction });
      itemsToKeep.push(existing);
      receivedItemIds.add(itemId);
    } else {
      const newItem = await model.create(item, { transaction });
      itemsToAdd.push(newItem);
    }
  }

  await job[setMethod]([...itemsToKeep, ...itemsToAdd], { transaction });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const syncSkillsToJob = async ({ jobId, skills = [], transaction }) => {
  const existingSkills = await JobRequiredSkill.findAll({
    where: { job_description_id: jobId },
    transaction,
  });

  const existingMap = new Map(
    existingSkills.map((rs) => [`${rs.skill_id}`, rs])
  );

  const receivedSkillIds = new Set();

  for (const skill of skills) {
    receivedSkillIds.add(skill.skill_id);

    if (existingMap.has(`${skill.skill_id}`)) {
      const existing = existingMap.get(`${skill.skill_id}`);
      if (existing.required_skill_level_id !== skill.required_skill_level_id) {
        await existing.update(
          {
            required_skill_level_id: skill.required_skill_level_id,
          },
          { transaction }
        );
      }
    } else {
      await JobRequiredSkill.create(
        {
          job_description_id: jobId,
          skill_id: skill.skill_id,
          required_skill_level_id: skill.required_skill_level_id,
        },
        { transaction }
      );
    }
  }

  for (const existing of existingSkills) {
    if (!receivedSkillIds.has(existing.skill_id)) {
      await existing.destroy({ transaction });
    }
  }
};

const includeRelations = () => [
  { model: Mission, as: "missions", through: { attributes: [] } },
  { model: Moyen, as: "moyens", through: { attributes: [] } },
  {
    model: AireProximite,
    as: "aireProximites",
    through: { attributes: [] },
  },
  {
    model: JobRequiredSkill,
    as: "requiredSkills",
    attributes: {
      exclude: ["job_description_id", "required_skill_level_id"],
    },
    include: [
      {
        model: Skill,
        include: [
          {
            model: SkillType,
            as: "type",
          },
        ],
      },
      {
        model: SkillLevel,
      },
    ],
  },

  {
    model: JobDescription,
    as: "superieurN1",
    attributes: ["id", "emploi", "filiere_activite", "famille"],
  },
  {
    model: JobDescription,
    as: "superieurN2",
    attributes: ["id", "emploi", "filiere_activite", "famille"],
  },
];

const findAllJobDescription = async (req, res) => {
  try {
    const jobs = await JobDescription.findAll({
      include: includeRelations(),
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const findJobDescriptionById = async (req, res) => {
  try {
    const job = await JobDescription.findByPk(req.params.id, {
      include: includeRelations(),
    });
    if (!job) return res.status(404).json({ message: "Not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createJobDescription = async (req, res) => {
  const {
    emploi,
    filiere_activite,
    famille,
    superieur_n1,
    superieur_n2,
    finalite,
    niveau_exigence,
    niveau_exp,
    status,
    version,
    missions = [],
    moyens = [],
    airesProximites = [],
    requiredSkills = [],
  } = req.body;

  const t = await sequelize.transaction();
  try {
    const job = await JobDescription.create(
      {
        emploi,
        filiere_activite,
        famille,
        superieur_n1,
        superieur_n2,
        finalite,
        niveau_exigence,
        niveau_exp,
        status,
        version,
      },
      { transaction: t }
    );

    await syncCreateJobDescription({
      job,
      items: missions,
      model: Mission,
      setMethod: "addMission",
      transaction: t,
    });
    await syncCreateJobDescription({
      job,
      items: moyens,
      model: Moyen,
      setMethod: "addMoyen",
      transaction: t,
    });
    await syncCreateJobDescription({
      job,
      items: airesProximites,
      model: AireProximite,
      setMethod: "addAireProximite",
      transaction: t,
    });

    await syncSkillsToJob({
      jobId: job.id,
      skills: requiredSkills,
      transaction: t,
    });

    const createdJob = await JobDescription.findByPk(job.id, {
      include: includeRelations(),
      transaction: t,
    });

    await t.commit();
    res.status(201).json(createdJob);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
function areArraysEqual(arr1, arr2, key = "id") {
  if (arr1.length !== arr2.length) return false;

  const set1 = new Set(arr1.map((item) => item[key]));
  const set2 = new Set(arr2.map((item) => item[key]));

  if (set1.size !== set2.size) return false;
  for (const val of set1) {
    if (!set2.has(val)) return false;
  }
  return true;
}

function areSkillsEqual(existingSkills, newSkills) {
  if (existingSkills.length !== newSkills.length) return false;

  const formatSkill = (s) => `${s.skill_id}-${s.required_skill_level_id}`;
  const existingSet = new Set(existingSkills.map(formatSkill));
  const newSet = new Set(newSkills.map(formatSkill));

  if (existingSet.size !== newSet.size) return false;
  for (const val of existingSet) {
    if (!newSet.has(val)) return false;
  }
  return true;
}

const updateJobDescription = async (req, res) => {
  const {
    emploi,
    filiere_activite,
    famille,
    superieur_n1,
    superieur_n2,
    finalite,
    niveau_exigence,
    niveau_exp,
    status,
    version,
    missions = [],
    moyens = [],
    airesProximites = [],
    requiredSkills = [],
  } = req.body;

  const t = await sequelize.transaction();
  try {
    const job = await JobDescription.findByPk(req.params.id, {
      include: [
        { model: Mission, as: "missions" },
        { model: Moyen, as: "moyens" },
        { model: AireProximite, as: "aireProximites" },
        { model: JobRequiredSkill, as: "requiredSkills" },
      ],
      transaction: t,
    });

    if (!job) {
      await t.rollback();
      return res.status(404).json({ message: "Not found" });
    }
    const updatedFields = {
      emploi,
      filiere_activite,
      famille,
      superieur_n1,
      superieur_n2,
      finalite,
      niveau_exigence,
      niveau_exp,
      status,
      version,
    };
    // Vérifier doublons skills
    if (hasDuplicateSkills(requiredSkills)) {
      return res.status(400).json({
        message: "Duplication de skills détectée (même skill et même niveau).",
      });
    }
    // Vérifie si les champs simples ont changé
    const hasFieldChanges = Object.entries(updatedFields).some(
      ([key, value]) => job[key] !== value
    );

    // Vérifie si les missions, moyens, airesProximites ont changé
    const missionsChanged = !areArraysEqual(job.missions, missions);
    const moyensChanged = !areArraysEqual(job.moyens, moyens);
    const airesChanged = !areArraysEqual(job.aireProximites, airesProximites);

    // Vérifie si les skills ont changé
    const requiredSkillsChanged = !areSkillsEqual(
      job.requiredSkills,
      requiredSkills
    );

    const hasChanges =
      hasFieldChanges ||
      missionsChanged ||
      moyensChanged ||
      airesChanged ||
      requiredSkillsChanged;

    if (!hasChanges) {
      await t.rollback();
      return res.status(400).json({
        message: "Aucune modification détectée sur la fiche de poste.",
      });
    }

    await job.update(
      {
        emploi,
        filiere_activite,
        famille,
        superieur_n1,
        superieur_n2,
        finalite,
        niveau_exigence,
        niveau_exp,
        status,
        version,
      },
      { transaction: t }
    );

    await SyncUpdateJobDescription({
      job,
      items: missions,
      model: Mission,
      relationName: "missions",
      setMethod: "setMissions",
      transaction: t,
    });

    await SyncUpdateJobDescription({
      job,
      items: moyens,
      model: Moyen,
      relationName: "moyens",
      setMethod: "setMoyens",
      transaction: t,
    });

    await SyncUpdateJobDescription({
      job,
      items: airesProximites,
      model: AireProximite,
      relationName: "aireProximites",
      setMethod: "setAireProximites",
      transaction: t,
    });

    await syncSkillsToJob({
      jobId: job.id,
      skills: requiredSkills,
      transaction: t,
    });

    const updatedJob = await JobDescription.findByPk(req.params.id, {
      include: includeRelations(),
      transaction: t,
    });

    await t.commit();
    res.json(updatedJob);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteJobDescription = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const job = await JobDescription.findByPk(req.params.id, {
      transaction: t,
    });
    if (!job) {
      await t.rollback();
      return res.status(404).json({ message: "Fiche de poste n'existe pas" });
    }

    await job.setMissions([], { transaction: t });
    await job.setMoyens([], { transaction: t });
    await job.setAireProximites([], { transaction: t });
    await JobRequiredSkill.destroy({
      where: { job_description_id: job.id },
      transaction: t,
    });

    await job.destroy({ transaction: t });
    await t.commit();
    res.json({ message: "Fiche de poste supprimée avec succès" });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};
function hasDuplicateSkills(skills) {
  const seen = new Set();
  for (const skill of skills) {
    const key = `${skill.skill_id}-${skill.required_skill_level_id}`;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}
module.exports = {
  findAllJobDescription,
  findJobDescriptionById,
  createJobDescription,
  updateJobDescription,
  deleteJobDescription,
};
