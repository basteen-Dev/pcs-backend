const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
// const { authJwt } = require("./app/middleware");

// const otpRoutes = require("./app/routes/otp.routes");


const app = express();

app.use(express.json());
// Set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key", // Use a secure secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));


// ##########################################################
// jwt verify for all apis
// ##########################################################

// app.use(authJwt.verifyToken);


// === cors methode 1 ===
// var corsOptions = {
//   origin: "http://localhost:8081"
// };
// app.use(cors(corsOptions));

// === cors methode 2 ===
// app.use(cors());// for development

// === cors methode 3 ===
const allowedOrigins = ["http://localhost:5173", "http://localhost:8081"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: false, // Allow cookies if needed
  })
);

// const db = require("./app/models");
// db.sequelize.sync();

// const db = require("./app/models");
// db.sequelize.sync()
//   .then(() => {
//     console.log("Synced db.");
//   })
//   .catch((err) => {
//     console.log("Failed to sync db: " + err.message);
//   });

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to PCS application." });
});


// const Role = db.role;

// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Db');
//   initial();
// });

function initial() {
  Role.create({
    id: 1,
    name: "attender"
  });

  Role.create({
    id: 2,
    name: "manager"
  });

  Role.create({
    id: 3,
    name: "admin"
  });
}

// require("./app/routes/tutorial.routes")(app);
// require("./app/routes/department.routes")(app);
// require("./app/routes/servicetype.routes")(app);
// require("./app/routes/properties.routes")(app);
// require('./app/routes/tickets.routes')(app);

// require('./app/routes/auth.routes')(app);
// require('./app/routes/user.routes')(app);

// require('./app/routes/uploadimage.routes')(app);

// app.use('/api/uploads', express.static(path.join(__dirname, './app/public/completedTicketImages')) )

// app.use("/api", otpRoutes); // Use OTP routes


// const path = require("path");
// // Serve static files from the 'public' directory
// app.use("/public", express.static(path.join(__dirname, "app", "public")));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}.`);
// });

 module.exports = app;