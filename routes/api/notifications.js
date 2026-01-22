const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const MONGODB_URL = process.env.MONGODB_URL;
const axios = require("axios");
const { sendEmail } = require("../../utils/constants");
// const db = require("monk")(MONGODB_URL);
const db = require("monk")(process.env.MONGODB_URL);
// const db = require("monk")("mongodb://localhost:27017/inventory-management");
const notifications = db.get("notifications");

// Initiate M-Pesa Payment via Paystack
router.get("/getNotifications/:operatorId", async (req, res) => {
  const operatorId = req.params.operatorId;

//   console.log(typeof(operatorId))
//   console.log(operatorId)
//   console.log(operatorId)

  try {
    const response = await notifications.find({to: operatorId});
    // console.log(response)
    res.json({
      success: true,
      message: "notifications fetched",
      result: [...response],
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
