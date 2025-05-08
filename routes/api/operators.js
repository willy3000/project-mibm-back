const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const MONGODB_URL = process.env.MONGODB_URL;
// const db = require("monk")(MONGODB_URL);
const db = require("monk")(process.env.MONGODB_URL);
const users = db.get("users");
const operators = db.get("operators");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateJWT = require("../../middleware/authenticate-jwt");
const {
  sendEmail,
  sendPermissionsEmail,
  sendTestEmail,
} = require("../../utils/constants");
const { validateAddUsers } = require("../../middleware/validate-subscription");

const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let password = "";

  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
};

const generateUserCode = (name) => {
  const initials = name.replace(/\s+/g, "").toUpperCase().slice(0, 2); // Get first 2 uppercase letters from the name

  const randomDigits = Math.floor(10 + Math.random() * 90); // Generate 2 random digits (10-99)
  const timestampPart = Date.now().toString().slice(-4); // Last 4 characters of the timestamp

  return `${initials}-${randomDigits}-${timestampPart}`;
};

//Add inventory user #mongodb
router.post(
  "/addInventoryUser/:userId",
  validateAddUsers,
  upload.single("image"),
  async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    const details = JSON.parse(req.body.operatorDetails);
    const operatorDetails = {
      id: uuidv4(),
      userId: req.params.userId,
      username: details.username,
      businessName: details.businessName,
      logo: null,
      image: req.file,
      email: details.email,
      userCode: generateUserCode(details.username),
      password: generatePassword(),
      role: "user",
      disabled: false,
      permissions: details.permissions,
    };

    console.log('adding operator')

    const user = await users.findOne({ email: operatorDetails.email });
    const operator = await operators.findOne({ email: operatorDetails.email });

    const emailExists = !!user || !!operator;

    if (emailExists) {
      res.json({
        success: false,
        message: "Email Already in Use",
      });
    } else {
      const isEmailValid = await sendTestEmail(
        operatorDetails?.email,
        operatorDetails?.businessName
      );
      console.log("email is valid : ", isEmailValid);

      if (isEmailValid) {
        try {
          operators.insert({ ...operatorDetails }).then(() => {
            sendEmail(
              operatorDetails?.username,
              operatorDetails?.email,
              operatorDetails?.userCode,
              operatorDetails?.password,
              operatorDetails?.businessName
            );
            res.json({
              success: true,
              message: "User Added",
            });
          });
        } catch (err) {
          res.json({
            success: false,
            message: err.message,
          });
        }
      } else {
        res.json({
          success: false,
          message: "Email does not exist",
        });
      }
    }
  }
);

//Update inventory user #mongodb
router.put(
  "/updateOperator/:userId/:operatorId",
  upload.single("image"),
  async (req, res) => {
    const details = JSON.parse(req.body.operatorDetails);

    const userId = req.params.userId;
    const operatorId = req.params.operatorId;

    let operatorDetails = {
      username: details.username,
      email: details.email,
      disabled: details.disabled,
      permissions: details?.permissions || null,
    };

    if (req.file) {
      operatorDetails = { ...operatorDetails, image: req.file };
    }

    try {
      operators
        .findOneAndUpdate(
          { userId: userId, id: operatorId }, // Query to find the document by ID
          {
            $set: {
              ...operatorDetails,
            },
          } // The data to update (only the fields provided in `updateData`)
        )
        .then((doc) => {
          if (doc) {
            sendPermissionsEmail(doc?.email, doc?.permissions);
            res.json({
              success: true,
              message: "Operator Updated",
              result: { ...doc },
            });
          }
        });
    } catch (err) {
      res.json({
        success: false,
        message: err.message,
      });
    }
  }
);
//Generate new password #mongodb
router.put("/generateNewPassword/:userId/:operatorId", async (req, res) => {
  const userId = req.params.userId;
  const operatorId = req.params.operatorId;

  try {
    operators
      .findOneAndUpdate(
        { userId: userId, id: operatorId }, // Query to find the document by ID
        {
          $set: {
            password: generatePassword(),
          },
        } // The data to update (only the fields provided in `updateData`)
      )
      .then((doc) => {
        if (doc) {
          res.json({
            success: true,
            message: "Password Updated",
            result: { ...doc },
          });
        }
      });
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
});

//get inventory items #mongodb
router.get("/getInventoryOperators/:userId", authenticateJWT, (req, res) => {
  const userId = req.params.userId;
  try {
    operators.find({ userId: userId }).then((doc) => {
      res.json({
        success: true,
        message: "users fetched",
        result: [...doc],
      });
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

//get operator permissions #mongodb
router.get(
  "/getPermissions/:userId/:operatorId",
  authenticateJWT,
  async (req, res) => {
    const { userId, operatorId } = req.params;
    const admin = await users.findOne({ adminId: userId, id: operatorId });
    const operator = await operators.findOne({
      userId: userId,
      id: operatorId,
    });

    if (admin) {
      return res.json({
        success: true,
        message: "permissions fetched",
        result: {
          canEditInventory: true,
          canEditEmployees: true,
          canAssignItems: true,
        },
      });
    } else {
      return res.json({
        success: true,
        message: "permissions fetched",
        result: operator?.permissions,
      });
    }
  }
);

//get operator by id #mongodb
router.get(
  "/getInventoryOperatorById/:userId/:operatorId",
  authenticateJWT,
  (req, res) => {
    const userId = req.params.userId;
    const operatorId = req.params.operatorId;
    try {
      operators.find({ userId: userId, id: operatorId }).then((doc) => {
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

//Log in #mongodb
router.post("/logIn", (req, res) => {
  const userDetails = {
    email: req.body.email,
    password: req.body.password,
  };

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
            username: account.username,
            logo: account.logo,
          },
        });
      } else {
        res.json({ success: false, message: "Invalid Password", user: null });
      }
    } else {
      res.json({ success: false, message: "Email does not exist", user: null });
    }
  });
});

//Get Current Logo #mongodb
router.post("/getCurrentLogo/:userId", (req, res) => {
  const userId = req.params.userId;

  users.findOne({ id: userId }).then((doc) => {
    const account = doc;
    if (account) {
      res.json({
        success: true,
        message: "Logo fetched",
        result: account.logo,
      });
    } else {
      res.json({
        success: false,
        message: "Account does not exist",
        result: null,
      });
    }
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
