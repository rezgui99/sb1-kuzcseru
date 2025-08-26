const express = require("express");
const router = express.Router();
const {
  createJobDescription,
  updateJobDescription,
  deleteJobDescription,
  findAllJobDescription,
  findJobDescriptionById,
} = require("../controllers/jobdescription");

router.get("/", findAllJobDescription);
router.get("/:id", findJobDescriptionById);
router.post("/", createJobDescription);
router.put("/:id", updateJobDescription);
router.delete("/:id", deleteJobDescription);

module.exports = router;
