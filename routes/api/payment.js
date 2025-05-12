const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const MONGODB_URL = process.env.MONGODB_URL;
const axios = require("axios");
// const db = require("monk")(MONGODB_URL);
const db = require("monk")(process.env.MONGODB_URL);
// const db = require("monk")("mongodb://localhost:27017/inventory-management");
const CurrencyConverter = require("currency-converter-lt");

const cheerio = require("cheerio");
const { sendTransactionReceipt, formatDate } = require("../../utils/constants");

// Function to scrape exchange rate
async function getUsdToKesRate() {
  try {
    const { data } = await axios.get(
      "https://www.google.com/search?q=USD+to+KES"
    );
    const $ = cheerio.load(data);

    // Extracting exchange rate from the page
    const rate = $("div[data-precision]").first().text();
    console.log("rate", rate);
    if (rate) {
      return parseFloat(rate);
    } else {
      throw new Error("Unable to find exchange rate on the page");
    }
  } catch (error) {
    console.error("Error fetching exchange rate:", error.message);
    throw error;
  }
}

const convertUsdToKes = async (usdAmount) => {
  console.log(await getUsdToKesRate());
};

const roundUpAmount = (amount) => {
  return Number(Math.ceil(amount));
};

// Initiate M-Pesa Payment via Paystack
router.post("/initializeMpesaStkPush", async (req, res) => {
  const { email = "live@gmail.com", amount, phone } = req.body;
  const convertedAmount = roundUpAmount(amount);
  //   console.log('data', amount, phone)
  const transactionDetails = {
    email,
    // amount: convertedAmount * 100,
    amount: Number(Math.ceil(amount)) * 100,
    currency: "KES",
    mobile_money: {
      phone,
      provider: "mpesa",
    },
  };

  console.log("transaction details", transactionDetails);

  try {
    const response = await axios.post(
      "https://api.paystack.co/charge",
      {
        ...transactionDetails,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("data", response.data.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.log("error occured");
    // console.log(error);
    const errRes = error.response?.data || { error: "Something went wrong" };
    return res.status(500).json(errRes);
  }
});

//mpesa receipt test
router.post("/initializeMpesaStkPush2", async (req, res) => {
  sendTransactionReceipt();
  console.log("receipt sent");
});

// Validate M-Pesa Payment via Paystack
router.post("/validateMpesaPayment/:reference", async (req, res) => {
  const { reference } = req.params;
  const businessName = req.body.businessName;
  const email = req.body.email;

  console.log("user is, ", businessName, email);
  console.log("type is, ", typeof businessName, typeof email);

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log(response.data);
    // sendTransactionReceipt()
    console.log(response.data.data);
    if (response.data.data.status === "success") {
      const transactionDate = formatDate(response.data.data.paid_at);
      const receiptNumber = response.data.data.receipt_number;
      const amount = response.data.data.amount;
      sendTransactionReceipt(
        businessName,
        email,
        transactionDate,
        receiptNumber,
        amount
      );
    }
    return res.status(200).json({
      success: response.data.data.status === "success" ? true : false,
      status: response.data.data.status,
      message: response.data.data.message,
    });
  } catch (error) {
    const errRes = error.message || { error: "Something went wrong" };
    return res.json({
      success: false,
      message: errRes,
    });
  }
});

module.exports = router;
