const db = require("../../models/index");
const { Employee, EmployeeSkill, Skill, SkillLevel, sequelize } = db;

async function syncEmployeeSkills({ employee, skills, transaction }) {
  await EmployeeSkill.destroy({
    where: { employee_id: employee.id },
    transaction,
  });

  for (const skillData of skills) {
    let skillInstance;

    if (skillData.id) {
      skillInstance = await Skill.findByPk(skillData.id, { transaction });
      if (!skillInstance)
        throw new Error(`Compétence avec id ${skillData.id} n'existe pas.`);
    } else if (skillData.skill?.name) {
      skillInstance = await Skill.findOne({
        where: { name: skillData.skill.name },
        transaction,
      });

      if (!skillInstance) {
        skillInstance = await Skill.create(
          {
            name: skillData.skill.name,
            description: skillData.skill.description || null,
            skill_type_id: skillData.skill.skill_type_id || null,
          },
          { transaction }
        );
      }
    } else {
      throw new Error(
        "Chaque compétence doit avoir un 'id' ou un objet 'skill' avec 'name'."
      );
    }

    // Gestion du niveau
    let skillLevelId = null;

    if (skillData.actual_skill_level_id) {
      const level = await SkillLevel.findByPk(skillData.actual_skill_level_id, {
        transaction,
      });
      if (!level)
        throw new Error(
          `Niveau avec id ${skillData.actual_skill_level_id} introuvable.`
        );
      skillLevelId = level.id;
    } else if (skillData.skill_level) {
      let level = await SkillLevel.findOne({
        where: { level_name: skillData.skill_level },
        transaction,
      });

      if (!level) {
        if (
          !skillData.skill_level_value ||
          !skillData.skill_level_description
        ) {
          throw new Error(
            `Pour créer le niveau '${skillData.skill_level}', 'skill_level_value' et 'skill_level_description' sont requis.`
          );
        }
        level = await SkillLevel.create(
          {
            level_name: skillData.skill_level,
            value: skillData.skill_level_value,
            description: skillData.skill_level_description,
          },
          { transaction }
        );
      }

      skillLevelId = level.id;
    } else if (skillData.skill_level_value) {
      let level = await SkillLevel.findOne({
        where: { value: skillData.skill_level_value },
        transaction,
      });

      if (!level) {
        if (!skillData.skill_level_description || !skillData.skill_level) {
          throw new Error(
            `Pour créer un nouveau niveau avec value ${skillData.skill_level_value}, fournir 'skill_level' et 'skill_level_description'.`
          );
        }
        level = await SkillLevel.create(
          {
            level_name: skillData.skill_level,
            value: skillData.skill_level_value,
            description: skillData.skill_level_description,
          },
          { transaction }
        );
      }

      skillLevelId = level.id;
    }

    await EmployeeSkill.create(
      {
        employee_id: employee.id,
        skill_id: skillInstance.id,
        actual_skill_level_id: skillLevelId,
        acquired_date: skillData.acquired_date || null,
        certification: skillData.certification || null,
        last_evaluated_date: skillData.last_evaluated_date || null,
      },
      { transaction }
    );
  }
}

const findAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: {
        model: EmployeeSkill,
        include: [Skill, SkillLevel],
      },
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: {
        model: EmployeeSkill,
        include: [Skill, SkillLevel],
      },
    });
    if (!employee)
      return res.status(404).json({ message: "L'employée n'existe pas" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEmployee = async (req, res) => {
  const {
    name,
    position,
    hire_date,
    email,
    phone,
    gender,
    location,
    notes,
    skills = [],
  } = req.body;

  console.log('📝 Création employé avec compétences:', { name, skillsCount: skills.length });

  const t = await sequelize.transaction();

  try {
    const employee = await Employee.create(
      { name, position, hire_date, email, phone, gender, location, notes },
      { transaction: t }
    );

    console.log('✅ Employé créé, ID:', employee.id);

    await syncEmployeeSkills({ employee, skills, transaction: t });

    console.log('✅ Compétences synchronisées');

    const createdEmployee = await Employee.findByPk(employee.id, {
      include: {
        model: EmployeeSkill,
        include: [Skill, SkillLevel],
      },
      transaction: t,
    });

    await t.commit();
    console.log('✅ Transaction validée');
    res.status(201).json(createdEmployee);
  } catch (err) {
    await t.rollback();
    console.error('❌ Erreur création employé:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  const {
    name,
    position,
    hire_date,
    email,
    phone,
    gender,
    location,
    notes,
    skills = [],
  } = req.body;

  console.log('📝 Mise à jour employé avec compétences:', { id: req.params.id, skillsCount: skills.length });

  const t = await sequelize.transaction();

  try {
    const employee = await Employee.findByPk(req.params.id, { transaction: t });
    if (!employee) {
      await t.rollback();
      return res.status(404).json({ message: "L'employée n'existe pas" });
    }

    console.log('✅ Employé trouvé, mise à jour...');

    await employee.update(
      { name, position, hire_date, email, phone, gender, location, notes },
      { transaction: t }
    );

    console.log('✅ Données employé mises à jour');

    await syncEmployeeSkills({ employee, skills, transaction: t });

    console.log('✅ Compétences synchronisées');

    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: {
        model: EmployeeSkill,
        include: [Skill, SkillLevel],
      },
      transaction: t,
    });

    await t.commit();
    console.log('✅ Transaction validée');
    res.json(updatedEmployee);
  } catch (error) {
    await t.rollback();
    console.error('❌ Erreur mise à jour employé:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const employee = await Employee.findByPk(req.params.id, { transaction: t });
    if (!employee) {
      await t.rollback();
      return res.status(404).json({ message: "L'employée n'existe pas" });
    }

    await EmployeeSkill.destroy({
      where: { employee_id: employee.id },
      transaction: t,
    });

    await employee.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Employee supprimée avec succès" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  findAllEmployees,
  findEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
