const express = require("express");
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const { db } = require("../../utils/constants");
const MONGODB_URL = process.env.MONGODB_URL;
// const db = require("monk")(MONGODB_URL);
const db = require("monk")(process.env.MONGODB_URL);
const questions = db.get("questions");
const employees = db.get("employees");
const projectParticipants = db.get("projectParticipants");
const users = db.get("users");
const events = db.get("events");
const answers = db.get("answers");
const inventory = db.get("inventory");
const items = db.get("items");
const assignments = db.get("assignments");
const authenticateJWT = require("../../middleware/authenticate-jwt");
const { uploadImage } = require("../../utils/constants");

//Add Item to inventory #mongodb
router.post(
  "/addEmployee/:userId",
  authenticateJWT,
  upload.single("image"),
  async (req, res) => {
    const employeeDetails = {
      id: uuidv4(),
      userId: req.params.userId,
      employeeName: req.body.employeeName,
      gender: req.body.gender,
      department: req.body.department,
      image: await uploadImage(req.file),
      deleted: false,
    };

    try {
      employees
        .insert({
          ...employeeDetails,
        })
        .then(() => {
          res.json({ success: true, message: "Employee Added" });
        });
    } catch (err) {
      res.json({ success: false, message: err });
    }
  }
);

//get inventory items #mongodb
router.get("/getEmployees/:userId", authenticateJWT, (req, res) => {
  const userId = req.params.userId;
  console.log("getting employees");
  try {
    employees.find({ userId: userId }).then((doc) => {
      res.json({
        success: true,
        message: "employees fetched",
        result: [...doc],
      });
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

//get employee by id #mongodb
router.get(
  "/getEmployeeById/:userId/:employeeId",
  authenticateJWT,
  (req, res) => {
    const userId = req.params.userId;
    const employeeId = req.params.employeeId;
    try {
      employees.find({ userId: userId, id: employeeId }).then((doc) => {
        res.json({
          success: true,
          message: "employee fetched",
          result: { ...doc[0] },
        });
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }
);

//get employee assignedItems by id #mongodb
router.get(
  "/getAssignedItems/:userId/:employeeId",
  authenticateJWT,
  async (req, res) => {
    const userId = req.params.userId;
    const employeeId = req.params.employeeId;
    try {
      const assignmentRecords = await assignments.find({
        userId: userId,
        employeeId: employeeId,
        returnedOn: null,
      });
      const assignedItems = await Promise.all(
        assignmentRecords.map(async (assignment) => {
          const item = await items.findOne({ id: assignment.itemId });
          return {
            assignmentId: assignment.id,
            name: item.name,
            assignedOn: assignment.assignedOn,
            status: item.status,
          };
        })
      );
      res.json({
        success: true,
        message: "assigned items fetched",
        result: [...assignedItems],
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
