const express = require("express");
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const MONGODB_URL = process.env.MONGODB_URL;
// const db = require("monk")(MONGODB_URL);
const db = require("monk")(process.env.MONGODB_URL);
const questions = db.get("questions");
const users = db.get("users");
const answers = db.get("answers");
const inventory = db.get("inventory");
const items = db.get("items");
const assignments = db.get("assignments");
const authenticateJWT = require("../../middleware/authenticate-jwt");
const ExcelJS = require("exceljs");
const logs = db.get("logs");
const operators = db.get("operators");

router.get("/exportLogs/:userId", authenticateJWT, async (req, res) => {
  // Sample JSON data to be converted to Excel (can be replaced with database data)
  const jsonData = await logs.find(
    { userId: req.params.userId },
    "userId operatorId operation timestamp status responseStatus"
  );

  console.log("jsonData", jsonData);

  // Create a new Excel workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Sheet");

  // Define the columns in the worksheet
  worksheet.columns = [
    { header: "User Id", key: "userId", width: 10 },
    { header: "Operator Id", key: "operatorId", width: 10 },
    { header: "Operation", key: "operation", width: 10 },
    { header: "Timestamp", key: "timestamp", width: 10 },
    { header: "Status", key: "status", width: 10 },
    { header: "Response Status", key: "responseStatus", width: 10 },
  ];

  // Add JSON data to worksheet
  jsonData.forEach((item) => {
    worksheet.addRow(item);
  });

  // Set headers for downloading the file
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", 'attachment; filename="data.xlsx"');

  // Write workbook to response
  await workbook.xlsx.write(res);
  res.end();
});

router.get("/getLogs/:userId", authenticateJWT, async (req, res) => {
  const userId = req.params.userId;

  try {
    const logRecords = await logs.find({ userId: userId });
    // Map through each log record to replace userId with the username
    const modifiedLogs = await Promise.all(
      logRecords.map(async (log) => {
        const operator = await operators.findOne({ id: log.operatorId });
        const admin = await users.findOne({ id: log.operatorId });
        return {
          ...log,
          username: operator
            ? operator?.username
            : admin
            ? admin?.username
            : "Unknown User", // Use a fallback in case user is not found
          role: admin ? "admin" : "user",
          userCode: admin ? "ADMIN" : operator?.userCode,
        };
      })
    );
    res.json({
      status: "success",
      message: "logs fetched",
      result: [...modifiedLogs],
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
