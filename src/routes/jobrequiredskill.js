const express = require("express");
const router = express.Router();

const {
  findAllJobRequiredSkills,
  findJobRequiredSkill,
  createJobRequiredSkill,
  updateJobRequiredSkill,
  deleteJobRequiredSkill,
} = require("../controllers/jobrequiredskill");

router.get("/", findAllJobRequiredSkills);
router.get("/:job_description_id/:skill_id", findJobRequiredSkill);
router.post("/", createJobRequiredSkill);
router.put("/:job_description_id/:skill_id", updateJobRequiredSkill);
router.delete("/:job_description_id/:skill_id", deleteJobRequiredSkill);

module.exports = router;
