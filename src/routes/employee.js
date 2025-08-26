const express = require("express");
const router = express.Router();
const {
  createEmployee,
  updateEmployee,
  findAllEmployees,
  findEmployeeById,
  deleteEmployee,
} = require("../controllers/employee");


const validateEmployee = require("../middleware/validateEmployee");

router.post("/", validateEmployee, createEmployee);
router.put("/:id", validateEmployee, updateEmployee);
router.get("/", findAllEmployees);
router.get("/:id", findEmployeeById);
router.delete("/:id", deleteEmployee);

module.exports = router;
