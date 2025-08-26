const express = require("express");
const router = express.Router();

const {
  findAllEmployeeSkills,
  findEmployeeSkill,
  createEmployeeSkill,
  updateEmployeeSkill,
  deleteEmployeeSkill,
} = require("../controllers/employeeskill");

router.get("/", findAllEmployeeSkills);
router.get("/:employee_id/:skill_id", findEmployeeSkill);
router.post("/", createEmployeeSkill);
router.put("/:employee_id/:skill_id", updateEmployeeSkill);
router.delete("/:employee_id/:skill_id", deleteEmployeeSkill);

module.exports = router;
