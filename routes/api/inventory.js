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
const logOperation = require("../../middleware/log-entry");

const nullValues = [null, "null", "undefined", undefined, ""];

//reusable
router.get("/getItemQuantities/:userId", authenticateJWT, async (req, res) => {
  const userId = req.params.userId;
  try {
    items.find({ userId: userId }).then(async (doc) => {
      const result = [...doc].reduce((acc, item) => {
        const { groupId } = item;
        acc[groupId] = (acc[groupId] || 0) + 1;
        return acc;
      }, {});
      res.json({
        success: true,
        message: "quantities fetched",
        result: result,
      });
    });
  } catch {
    return null;
  }
});

//Add Item group to inventory #mongodb
router.post(
  "/addItemGroup/:userId",
  authenticateJWT,
  upload.single("image"),
  logOperation,
  async (req, res) => {
    const itemDetails = {
      id: uuidv4(),
      userId: req.params.userId,
      name: req.body.itemName,
      type: req.body.itemType,
      quantity: 0,
      image: req.file,
      deleted: false,
    };

    try {
      inventory
        .insert({
          ...itemDetails,
        })
        .then(() => {
          res.json({ success: true, message: "Item Added" });
        });
    } catch (err) {
      res.json({ success: false, message: err });
    }
  }
);

//Add Item to inventory #mongodb
router.post(
  "/addItem/:userId/:groupId",
  authenticateJWT,
  logOperation,
  upload.single("image"),
  async (req, res) => {
    const itemDetails = {
      id: uuidv4(),
      userId: req.params.userId,
      groupId: req.params.groupId,
      serialNumber: req.body.serialNumber,
      name: req.body.name,
      category: req.body.category,
      purchaseDate: req.body.purchaseDate,
      warrantyExpiry: req.body.warrantyExpiry,
      assignedTo: null,
      status: req.body.status,
      deleted: false,
    };

    const existingSerial = await items.find({
      serialNumber: itemDetails.serialNumber,
    });
    console.log(existingSerial);

    try {
      if (existingSerial.length === 0) {
        items
          .insert({
            ...itemDetails,
          })
          .then(() => {
            res.json({ success: true, message: "Item Added" });
          });
      } else {
        res.json({ success: false, message: "Serial NUmber Exists" });
      }
    } catch (err) {
      res.json({ success: false, message: err });
    }
  }
);

//get inventory items #mongodb
router.get("/getInventoryItems/:userId", authenticateJWT, async (req, res) => {
  const userId = req.params.userId;
  const { page, limit, itemsPerPage, searchQuery, type } = req.query;

  const skip = (page - 1) * limit;

  let query = {
    userId: userId, // Exact match for userId
  };
  const options = {
    limit: parseInt(limit),
    skip: parseInt(skip),
  };

  if (!nullValues.includes(type)) {
    console.log;
    query = { ...query, type: type };
  } else {
  }
  if (!nullValues.includes(searchQuery)) {
    query = { ...query, name: { $regex: searchQuery, $options: "i" } };
  } else {
  }
  console.log(query);
  const totalItems = await inventory.count({ ...query });

  console.log(type, searchQuery);

  try {
    inventory.find(query, options).then((doc) => {
      const totalPages = Math.ceil(totalItems / limit);
      res.json({
        success: true,
        message: "inventory fetched",
        result: [...doc],
        totalPages: totalPages,
        currentPage: page,
        totalItems: totalItems,
      });
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

//get inventory item group by id #mongodb
router.get(
  "/getItemGroupById/:userId/:groupId",
  authenticateJWT,
  (req, res) => {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    try {
      inventory.find({ userId: userId, id: groupId }).then((doc) => {
        res.json({
          success: true,
          message: "inventory fetched",
          result: { ...doc[0] },
        });
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }
);

//get group items #mongodb
router.get(
  "/getGroupItems/:userId/:groupId",
  authenticateJWT,
  async (req, res) => {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const totalItems = await items.count({ userId: userId, groupId: groupId });

    const skip = (page - 1) * limit;

    try {
      items
        .find(
          { userId: userId, groupId: groupId },
          {
            limit: limit,
            skip: skip,
          }
        )
        .then((doc) => {
          const totalPages = Math.ceil(totalItems / limit);
          res.json({
            success: true,
            message: "inventory fetched",
            result: [...doc],
            totalPages: totalPages,
            currentPage: page,
            totalItems: totalItems,
          });
        });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }
);

//get item by id #mongodb
router.get(
  "/getItemById/:userId/:groupId/:itemId",
  authenticateJWT,
  (req, res) => {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const itemId = req.params.itemId;

    try {
      items
        .find({ userId: userId, groupId: groupId, id: itemId })
        .then((doc) => {
          res.json({
            success: true,
            message: "inventory fetched",
            result: { ...doc[0] },
          });
        });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }
);

//Assign item to employee #mongodb
router.post("/assignItem", logOperation, authenticateJWT, (req, res) => {
  const assignmentDetails = {
    id: uuidv4(),
    userId: req.body.userId,
    employeeId: req.body.employeeId,
    groupId: req.body.groupId,
    itemId: req.body.itemId,
    assignedOn: new Date(),
    returnedOn: null,
  };

  try {
    assignments
      .insert({
        ...assignmentDetails,
      })
      .then(() => {
        items.update(
          {
            id: assignmentDetails.itemId,
            userId: assignmentDetails.userId,
            groupId: assignmentDetails.groupId,
          },
          {
            $set: {
              assignedTo: assignmentDetails.employeeId,
              assignmentId: assignmentDetails.id,
            },
          }
        );
        res.json({ success: true, message: "Item Assigned" });
      });
  } catch (err) {
    res.json({ success: false, message: err });
  }
});

//UN-assign item from employee #mongodb
router.post(
  "/unassignItem/:userId/:groupId/:itemId/:assignmentId",
  authenticateJWT,
  (req, res) => {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const itemId = req.params.itemId;
    const assignmentId = req.params.assignmentId;

    try {
      assignments
        .update(
          {
            id: assignmentId,
            userId: userId,
            groupId: groupId,
            itemId: itemId,
          },
          {
            $set: {
              returnedOn: new Date(),
            },
          }
        )
        .then(() => {
          items.update(
            {
              assignmentId: assignmentId,
              userId: userId,
              groupId: groupId,
              id: itemId,
            },
            {
              $set: {
                assignedTo: null,
                assignmentId: null,
              },
            }
          );
        })
        .then(() => {
          res.json({ success: true, message: "Item Unassigned" });
        });
    } catch (err) {
      res.json({ success: false, message: err });
    }
  }
);

//get item assignment history by id #mongodb
router.get(
  "/getItemAssignmentHistory/:userId/:groupId/:itemId",
  authenticateJWT,
  (req, res) => {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const itemId = req.params.itemId;
    const assignmentId = req.params.assignmentId;

    try {
      assignments
        .find({ userId: userId, groupId: groupId, itemId: itemId })
        .then((doc) => {
          res.json({
            success: true,
            message: "assignments fetched",
            result: [...doc.reverse()],
          });
        });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }
);

//Update item status #mongodb
router.post(
  "/updateItemStatus/:userId/:groupId/:itemId",
  authenticateJWT,
  (req, res) => {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const itemId = req.params.itemId;
    const status = req.body.status;

    try {
      items
        .update(
          {
            id: itemId,
            userId: userId,
            groupId: groupId,
          },
          {
            $set: {
              status: status,
            },
          }
        )
        .then(() => {
          res.json({ success: true, message: "Status updated" });
        });
    } catch (err) {
      res.json({ success: false, message: err });
    }
  }
);

module.exports = router;
