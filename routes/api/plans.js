const express = require("express");
const router = express.Router();
const MONGODB_URL = process.env.MONGODB_URL;
// const db = require("monk")(MONGODB_URL);
const db = require("monk")(process.env.MONGODB_URL);
const plans = db.get("plans");
const subscriptions = db.get("subscriptions");
const authenticateJWT = require("../../middleware/authenticate-jwt");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const { sendNotification, getPlanName } = require("../../utils/constants");

const getEndDate = (days) => {
  const endDate = new Date(); // Create a copy of startDate
  endDate.setDate(endDate.getDate() + days); // Add the days
  return endDate;
};

router.get("/getPlans", authenticateJWT, async (req, res) => {
  try {
    const plansList = await plans.find({});

    res.json({
      status: "success",
      message: "plans fetched",
      result: [...plansList],
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.get(
  "/getSubscriptionPlanById/:userId",
  authenticateJWT,
  async (req, res) => {
    const userId = req.params.userId;

    const subscription = await subscriptions.findOne({ userId: userId });
    const plan = await plans.findOne({ planId: subscription?.planId });

    if (subscription) {
      return res.json({
        success: true,
        result: { ...subscription, plan: plan?.planName },
        message: "Subscription fetched",
      });
    } else {
      return res.json({
        success: true,
        result: null,
        message: "Failed to fetch subscription",
      });
    }
  }
);

router.post(
  "/handlePaymentAndSubscription/:userId",
  authenticateJWT,
  async (req, res) => {
    // console.log("body :", req.body);
    const subscriptionDetails = {
      id: uuidv4(),
      userId: req.params.userId,
      planId: req.body.planId,
      duration: req.body.billingCycle === "yearly" ? 365 : 30,
      startDate: new Date(),
      endDate: getEndDate(req.body.billingCycle === "yearly" ? 365 : 30),
      billingCycle: req.body.billingCycle,
      amountBilled: req.body.amount,
      active: true,
    };

    try {
      subscriptions.insert({ ...subscriptionDetails }).then(() => {
        const notificationsDetails = {
          title: `Welcome to ${getPlanName(subscriptionDetails?.planId)}`,
          message: `Awesome!! Now you can explore all the new cool stuff you can do in ${getPlanName(
            subscriptionDetails?.planId
          )}`,
          type: "subscription", //["info", "warning", "system"]
          to: subscriptionDetails?.userId,
          from: "system",
          createdAt: new Date(),
          seenAt: null,
          priority: "Low", //["low", "Medium", "High"]
        };
        sendNotification(notificationsDetails, req);
        return res.json({
          success: true,
          message: "Plan updated",
        });
      });
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;
