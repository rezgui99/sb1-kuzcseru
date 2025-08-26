const express = require("express");
const router = express.Router();

const {
  createMoyen,
  deleteMoyen,
  getAllMoyens,
  getMoyenById,
  updateMoyen,
} = require("../controllers/moyen");

router.get("/", getAllMoyens);
router.get("/:id", getMoyenById);
router.post("/", createMoyen);
router.put("/:id", updateMoyen);
router.delete("/:id", deleteMoyen);

module.exports = router;
