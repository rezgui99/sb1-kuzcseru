const fetch = require("node-fetch");

async function getJobSkillsFromMyAPI() {
  const response = await fetch("http://localhost:3000/api/job-skills-with-employees");
  if (!response.ok) throw new Error("Erreur récupération JobSkills");
  return response.json();
}

async function sendSkillsToFastAPI() {
  try {
    const jobSkillsWithEmployees = await getJobSkillsFromMyAPI();

    const fastApiUrl = "url ";

    const response = await fetch(fastApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobSkillsWithEmployees),
    });

    const data = await response.json();
    console.log("Réponse FastAPI:", data);
  } catch (err) {
    console.error("Erreur:", err.message);
  }
}

sendSkillsToFastAPI();
