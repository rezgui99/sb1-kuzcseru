const express = require("express");
const router = express.Router();

const {
  findAllSkillTypes,
  findSkillTypeById,
  createSkillType,
  updateSkillType,
  deleteSkillType,
} = require("../controllers/skilltype");

router.get("/", findAllSkillTypes);
router.get("/:id", findSkillTypeById);
router.post("/", createSkillType);
router.put("/:id", updateSkillType);
router.delete("/:id", deleteSkillType);

module.exports = router;
