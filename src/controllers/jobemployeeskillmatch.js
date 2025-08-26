const db = require("../../models/index");
const {
  JobRequiredSkill,
  Skill,
  SkillLevel,
  EmployeeSkill,
  Employee,
  JobDescription,
} = db;

const JobEmployeeSkillMatch = async (req, res) => {
  const jobId = parseInt(req.params.jobId);
  const fastApiURL = process.env.FAST_API_URL;

  try {
    // Vérifier que le job existe
    const job = await JobDescription.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: "Fiche de poste introuvable." });
    }

    // Récupérer les compétences requises pour ce job
    const jobSkills = await JobRequiredSkill.findAll({
      where: { job_description_id: jobId },
      include: [
        { model: Skill, attributes: ["id", "name"] },
        { model: SkillLevel, attributes: ["id", "value"] },
      ],
    });

    if (jobSkills.length === 0) {
      return res.status(200).json({
        message: "Aucune compétence requise définie pour cette fiche de poste.",
        job_description_id: jobId,
        required_skills_level: [],
        matching_employees: [],
      });
    }
    const employees = await Employee.findAll({
      attributes: ["id", "name", "email", "position"],
      include: [
        {
          model: EmployeeSkill,
          include: [
            { model: Skill, attributes: ["id", "name"] },
            { model: SkillLevel, attributes: ["id", "value"] },
          ],
        },
      ],
    });

    const employeesBySkill = {};
    for (const emp of employees) {
      for (const empSkill of emp.EmployeeSkills) {
        const skillId = empSkill.skill_id;
        if (!employeesBySkill[skillId]) employeesBySkill[skillId] = new Set();
        employeesBySkill[skillId].add(emp.id);
      }
    }

    // Identifier les employés qui ont au moins une des compétences requises
    const matchedEmployeeIds = new Set();
    for (const js of jobSkills) {
      const skillId = js.skill_id;
      const matching = employeesBySkill[skillId] || [];
      for (const empId of matching) {
        matchedEmployeeIds.add(empId);
      }
    }

    // Récupérer les données complètes des employés correspondants
    const matchingEmployees = employees
      .filter((e) => matchedEmployeeIds.has(e.id))
      .map((e) => ({
        employee_id: e.id,
        name: e.name,
        email: e.email,
        position: e.position,
        actual_skills_level: e.EmployeeSkills.map((s) => ({
          skill_id: s.skill_id,
          skill_name: s.Skill?.name || null,
          level_id: s.SkillLevel?.id || null,
          level_value: s.SkillLevel?.value || null,
        })),
      }));

    // Structure de la réponse
    const fastApiInput = {
      job_description: {
        job_description_id: jobId,
        required_skills_level: jobSkills.map((js) => ({
          skill_id: js.skill_id,
          skill_name: js.Skill?.name || null,
          level_id: js.required_skill_level_id,
          level_value: js.SkillLevel?.value || null,
        })),
      },
      employees: matchingEmployees,
    };
    let response = [];
    const result = await calculateScoreWithFastAPI(fastApiURL, fastApiInput);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de l'export des compétences du poste:", error);
    return res.status(500).json({ message: "Erreur serveur interne." });
  }
};
async function calculateScoreWithFastAPI(fastApiURL, payload) {
  const res = await fetch(`${fastApiURL}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de l’appel à FastAPI");
  }

  return res.json();
}

module.exports = {
  JobEmployeeSkillMatch,
};
