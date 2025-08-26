const express = require("express");
const {
  SaveCallbackLinkedin,
  ShareOnLinkedin,
  welcomeLinkedin,
} = require("../controllers/linkedin");
const router = express.Router();
router.get("/welcome", welcomeLinkedin);
router.post("/callback", SaveCallbackLinkedin);
router.post("/share", ShareOnLinkedin);
module.exports = router;
