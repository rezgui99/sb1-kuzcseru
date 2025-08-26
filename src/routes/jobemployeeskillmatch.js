const express = require("express");
const router = express.Router();

const {
  JobEmployeeSkillMatch,
} = require("../controllers/jobemployeeskillmatch");


router.get("/:jobId", JobEmployeeSkillMatch);

module.exports = router;
