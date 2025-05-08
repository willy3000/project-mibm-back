const MONGODB_URL = process.env.MONGODB_URL;
// const db = require("monk")(MONGODB_URL);
const db = require("monk")(process.env.MONGODB_URL);
const logs = db.get("logs");
const operators = db.get("operators");

// Set up multer for file handling (destination and filename settings)

const logOperation = async (req, res, next) => {
  // Create a base log entry
  console.log("body", req.body);
  const logEntry = {
    userId: req.params.userId || null, // Capture user ID or default to 'anonymous'
    operatorId: req.body.operatorId || null, // Capture user ID or default to 'anonymous'
    operation: req.path, // Operation or route path
    details: req.body, // Additional request data
    timestamp: new Date(),
    status: "pending", // Default status, to be updated later
  };

  // Attach a listener to update log status to 'success' if the response is successful
  res.on("finish", async () => {
    try {
      logEntry.status =
        res.statusCode >= 200 && res.statusCode < 400 ? "success" : "failed";
      logEntry.responseStatus = res.statusCode;
      await logs.insert(logEntry);
    } catch (error) {
      console.error("Error logging successful operation:", error);
    }
  });

  // Attach a listener to update log status to 'failed' if an error occurs
  res.on("error", async () => {
    try {
      logEntry.status = "failed";
      await logs.insert(logEntry);
    } catch (error) {
      console.error("Error logging failed operation:", error);
    }
  });

  next(); // Continue to the next middleware or route handler
};

module.exports = logOperation;
