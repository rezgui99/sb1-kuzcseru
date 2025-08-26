const express = require("express");
const router = express.Router();

const {
  findAllSkillLevels,
  findSkillLevelById,
  createSkillLevel,
  updateSkillLevel,
  deleteSkillLevel,
} = require("../controllers/skilllevel");

router.get("/", findAllSkillLevels);
router.get("/:id", findSkillLevelById);
router.post("/", createSkillLevel);
router.put("/:id", updateSkillLevel);
router.delete("/:id", deleteSkillLevel);

module.exports = router;
