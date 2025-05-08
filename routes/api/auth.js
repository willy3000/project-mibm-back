const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const MONGODB_URL = process.env.MONGODB_URL;
// const db = require("monk")(MONGODB_URL);
const db = require("monk")(process.env.MONGODB_URL);
// const db = require("monk")("mongodb://localhost:27017/inventory-management");
const users = db.get("users");
const operators = db.get("operators");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateJWT = require("../../middleware/authenticate-jwt");
const logOperation = require("../../middleware/log-entry");

//Sign Up #mongodb
router.post("/signUp", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const userDetails = {
    id: uuidv4(),
    username: req.body.username,
    businessName: req.body.businessName,
    logo: null,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, salt),
    role: "amdin",
    disabled: false,
    permissions: {},
  };

  users.find({}).then((doc) => {
    userAccounts = [...doc];
    const emailExists = userAccounts.some(
      (el) => el.email === userDetails.email
    );

    if (emailExists) {
      res.json({
        success: false,
        message: "",
        error: "Email Already in Use",
        user: null,
      });
    } else {
      users.insert({ ...userDetails, adminId: userDetails.id }).then(() => {
      });
      const token = jwt.sign({ username: userDetails.username }, JWT_SECRET, {
        // expiresIn: "1h",
      });
      // Set the token as an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: false, // Only use HTTPS in production
        sameSite: "None", // Protect against CSRF
        maxAge: 3600000, // 1 hour expiration
        path: "/",
      });
      res.json({
        success: true,
        message: "Sign Up Successful",
        token: token,
        user: {
          userId: userDetails.id,
          operatorId: userDetails.id,
          username: userDetails.username,
          logo: userDetails.logo,
          businessName: userDetails.businessName,
        },
      });
      res.send();
    }
  });
});

//Log in #mongodb
router.post("/logIn", logOperation, (req, res) => {
  const userDetails = {
    email: req.body.email,
    userCode: req.body.userCode,
    password: req.body.password,
    loginType: req.body.loginType,
  };

  if (userDetails.loginType === "admin") {
    users.find({ email: userDetails.email }).then(async (doc) => {
      const account = doc[0];
      if (account) {
        const isPasswordValid = await bcrypt.compare(
          userDetails.password,
          account.password
        );
        if (isPasswordValid) {
          const token = jwt.sign({ username: account.username }, JWT_SECRET, {
            // expiresIn: "1h",
          });

          // Set the token as an HTTP-only cookie
          res.cookie("token", token, {
            httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
            secure: false, // Only use HTTPS in production
            sameSite: "None", // Use 'None' for cross-origin requests
            maxAge: 3600000, // 1 hour expiration
            path: "http://localhost:3000",
          });
          res.json({
            success: true,
            message: "Login Successful",
            token: token,
            user: {
              userId: account.id,
              operatorId: account.id,
              username: account.username,
              logo: account.logo,
              businessName: account.businessName,
            },
          });
        } else {
          res.json({ success: false, message: "Invalid Password", user: null });
        }
      } else {
        res.json({
          success: false,
          message: "Email does not exist",
          user: null,
        });
      }
    });
  } else {
    operators.find({ userCode: userDetails.userCode }).then(async (doc) => {
      const account = doc[0];
      if (account) {
        if (!account.disabled) {
          const isPasswordValid = userDetails.password === account.password;
          if (isPasswordValid) {
            const token = jwt.sign({ username: account.username }, JWT_SECRET, {
              // expiresIn: "1h",
            });

            // Set the token as an HTTP-only cookie
            res.cookie("token", token, {
              httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
              secure: false, // Only use HTTPS in production
              sameSite: "None", // Use 'None' for cross-origin requests
              maxAge: 3600000, // 1 hour expiration
              path: "http://localhost:3000",
            });
            res.json({
              success: true,
              message: "Login Successful",
              token: token,
              user: {
                userId: account.userId,
                operatorId: account.id,
                username: account.username,
                logo: account.logo,
                businessName: account.businessName,
              },
            });
          } else {
            res.json({
              success: false,
              message: "Invalid Password",
              user: null,
            });
          }
        } else {
          res.json({
            success: false,
            message: "You Account has been disabled by the admin",
            user: null,
          });
        }
      } else {
        res.json({
          success: false,
          message: "User Code does not exist",
          user: null,
        });
      }
    });
  }
});

//get user role #mongodb
router.get("/getUserRole/:operatorId/", authenticateJWT, async (req, res) => {
  const operatorId = req.params.operatorId;

  const admin = await users.find({ id: operatorId });
  const operator = await operators.find({ id: operatorId });

  console.log("admin", admin);
  console.log("operator", operator);

  if (admin.length > 0 && operator.length === 0) {
    return res.json({
      success: true,
      message: "role fetched",
      result: {
        role: "admin",
      },
    });
  }
  return res.json({
    success: true,
    message: "role fetched",
    result: {
      role: "user",
    },
  });
});

//Update Details #mongodb
router.post("/updateDetails/:userId", upload.single("logo"), (req, res) => {
  const userDetails = {
    userId: req.params.userId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    logo: req.file,
    imageChanged: req.body.imageChanged,
  };

  users.find({}).then((doc) => {
    const account = doc[0];
    users
      .update(
        { id: userDetails.userId },
        {
          $set: {
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            email: userDetails.email,
            logo:
              userDetails.imageChanged === "true"
                ? userDetails.logo
                : account.logo,
          },
        }
      )
      .then((doc) => {
        users.find({ id: userDetails.userId }).then((doc) => {
          res.json({
            success: true,
            message: "User Update Successful",
            user: {
              userId: doc[0].id,
              firstName: doc[0].firstName,
              lastName: doc[0].lastName,
              email: doc[0].email,
              logo: doc[0].logo,
            },
          });
        });
      });
  });
});

module.exports = router;
