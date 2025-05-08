const MONGODB_URL = process.env.MONGODB_URL;
// const db = require("monk")(MONGODB_URL);
const db = require("monk")(process.env.MONGODB_URL);
const logs = db.get("logs");
const plans = db.get("plans");
const subscriptions = db.get("subscriptions");
const operators = db.get("operators");

// Set up multer for file handling (destination and filename settings)

const validateAddUsers = async (req, res, next) => {
  const userId = req.params.userId;

  const subscription = await subscriptions.findOne({ userId: userId });
  let plan = await plans.findOne({ planId: subscription?.planId });
  const userCount = await operators.count({ userId: userId });
  if (!plan) {
    plan = await plans.findOne({ planId: "pl_000" });
  }

  console.log(userCount);
  console.log(plan);

  if (userCount < plan?.limits?.max_users) {
    next();
  } else {
    return res.json({
      success: false,
      message: "Your have reached your limit for users",
    });
  }
};

module.exports = { validateAddUsers };
