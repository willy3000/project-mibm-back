const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var cors = require("cors");

const corsOptions = {
  // origin: "http://localhost:3000", // Replace with your frontend domain
  // origin: "http://192.168.100.6:3000", // Replace with your frontend domain,
  // origin: [
  //   "http://localhost:3000",
  //   "http://192.168.100.6:3000",
  //   "https://inventory-project-mibm.netlify.app",
  // ],
  origin: "*", // Replace with your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  credentials: true, // If you need to send cookies or HTTP authentication
};

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://192.168.100.6:3000",
//   "https://inventory-project-mibm.netlify.app",
//   "https://www.inventory-project-mibm.netlify.app",
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true,
// };

// app.use(cors());
app.use(cors(corsOptions));
app.use(cookieParser()); // Make sure this is used before your routes

//Authentication
app.use("/api/auth", require("./routes/api/auth"));

//inventory Api
app.use("/api/inventory", require("./routes/api/inventory"));

//employees Api
app.use("/api/employees", require("./routes/api/employees"));

//stats Api
app.use("/api/stats", require("./routes/api/stats"));

//operators Api
app.use("/api/operators", require("./routes/api/operators"));

//logs Api
app.use("/api/logs", require("./routes/api/logs"));

//plans Api
app.use("/api/plans", require("./routes/api/plans"));

//payment Api
app.use("/api/payment", require("./routes/api/payment"));

// //products Api
// app.use('/api/products', require('./routes/api/products'))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started  on port ${PORT}`));
