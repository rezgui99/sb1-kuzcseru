const express = require("express");
const router = express.Router();

const {
  findAllSkills,
  findSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skill");



router.get("/", findAllSkills);
router.get("/:id", findSkillById);
router.post("/",  createSkill);
router.put("/:id", updateSkill);
router.delete("/:id", deleteSkill);

module.exports = router;
