const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const MONGODB_URL = process.env.MONGODB_URL;
const axios = require('axios');
// const db = require("monk")(MONGODB_URL);
const db = require("monk")(process.env.MONGODB_URL);
// const db = require("monk")("mongodb://localhost:27017/inventory-management");


// Initiate M-Pesa Payment via Paystack
router.post("/initializeMpesaStkPush", async (req, res) => {
  const { email = "live@gmail.com", amount, phone } = req.body;

  console.log("running");

  try {
    const response = await axios.post(
      "https://api.paystack.co/charge",
      {
        email,
        amount,
        currency: "KES",
        mobile_money: {
          phone,
          provider: "mpesa",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("data", response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    const errRes = error.response?.data || { error: "Something went wrong" };
    return res.status(500).json(errRes);
  }
});

module.exports = router;
