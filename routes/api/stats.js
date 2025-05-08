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

//get item status stats #mongodb
router.get("/getItemStatusStats/:userId", authenticateJWT, async (req, res) => {
  const userId = req.params.userId;
  const active = await items.count({ status: "active", userId: userId });
  const damaged = await items.count({ status: "damaged", userId: userId });
  const under_maintenance = await items.count({
    status: "under maintenance",
    userId: userId,
  });
  const total_items = await items.count({
    userId: userId,
  });

  try {
    res.json({
      success: true,
      message: "inventory fetched",
      result: {
        active: active,
        damaged: damaged,
        under_maintenance: under_maintenance,
        total_items: total_items,
      },
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

//get stock level stats #mongodb
router.get("/getStockLevelStats/:userId", authenticateJWT, async (req, res) => {
  const userId = req.params.userId;
  let stockCategories = {
    lowStock: 0,
    moderateStock: 0,
    optimalStock: 0,
  };
  try {
    items.find({ userId: userId }).then(async (doc) => {
      const result = [...doc].reduce((acc, item) => {
        const { groupId } = item;
        acc[groupId] = (acc[groupId] || 0) + 1;
        return acc;
      }, {});

      // Loop through the JSON object
      for (const [key, value] of Object.entries(result)) {
        if (value < 10) {
          stockCategories.lowStock++;
        } else if (value >= 10 && value <= 30) {
          stockCategories.moderateStock++;
        } else if (value > 30) {
          stockCategories.optimalStock++;
        }
      }
      res.json({
        success: true,
        message: "stock level data fetched",
        result: stockCategories,
      });
    });
  } catch {
    return null;
  }
});

module.exports = router;
