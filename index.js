const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var cors = require("cors");

const corsOptions = {
  // origin: "http://localhost:3000", // Replace with your frontend domain
  // origin: "http://192.168.100.6:3000", // Replace with your frontend domain,
  origin: [
    "http://localhost:3000",
    "http://192.168.100.6:3000",
    "https://inventory-project-mibm.netlify.app",
  ],
  // origin: "*", // Replace with your frontend domain
  // origin: "https://inventory-project-mibm.netlify.app", // Replace with your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  credentials: true, // If you need to send cookies or HTTP authentication
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "*", // Your Next.js app
    origin: [
      "http://localhost:3000",
      "http://192.168.100.6:3000",
      "https://inventory-project-mibm.netlify.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store socket connections with userId (assumes user auth)

app.set("io", io); // So we can access it in route files
const connectedUsers = new Map();
app.set("connectedUsers", connectedUsers);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  // Expect frontend to emit a `register` event with userId
  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

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

//notifications Api
app.use("/api/notifications", require("./routes/api/notifications"));

//payment Api
app.use("/api/payment", require("./routes/api/payment"));

// //products Api
// app.use('/api/products', require('./routes/api/products'))

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started  on port ${PORT}`));
