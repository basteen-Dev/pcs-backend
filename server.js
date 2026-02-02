const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
var bcrypt = require("bcryptjs");
require('dotenv').config();
// const { authJwt } = require("./app/middleware");

const otpRoutes = require("./app/routes/otp.routes");


const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
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
const allowedOrigins = ["http://localhost:5173", "http://localhost:8081", "https://pcs-backend-tyz9.onrender.com"];
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

const db = require("./app/models");
// db.sequelize.sync();

// const db = require("./app/models");


const Role = db.role;


async function createAdminIfNotExists() {
  const [admin, created] = await db.user.findOrCreate({
    where: { username: 'PCSADMIN', mobile_no: 1234567891 },
    defaults: {
      username: 'PCSADMIN',
      password: await bcrypt.hash('PCSADMIN@123', 10),
      user_role: 3,
      mobile_no: 1234567891
    }
  });

  if (created) {
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️ Admin already exists');
  }
}

function initial() {
  Role.findOrCreate({
    where: {
      id: 1,
      name: "attender"
    },
    defaults: {
      id: 1,
      name: "attender"
    }
  }
  );

  Role.findOrCreate({
    where: {
      id: 2,
      name: "manager"
    },
    defaults: {
      id: 2,
      name: "manager"
    }
  });

  Role.findOrCreate({
    where: {
      id: 3,
      name: "admin"
    },
    defaults: {
      id: 3,
      name: "admin"
    }
  }

  );
}



db.sequelize.sync()
  .then(async () => {
    await createAdminIfNotExists();
    initial();
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to PCS application." });
});


app.post("/test", async (req, res) => {

  const { token } = req.body;



  try {

    const message = {
      "token": token,
      "notification": {
        "body": "This week's edition is now available.",
        "title": "NewsMagazine.com",
      },
      "android": {
        "priority": "normal"
      },
    };



    const response = await messaging.send(message);

    console.log("log on test response:", response);


    res.send({ response });


  } catch (e) {

    console.log("error on text:", e);
    res.send({ e });

  }


});




require("./app/routes/tutorial.routes")(app);
require("./app/routes/department.routes")(app);
require("./app/routes/servicetype.routes")(app);
require("./app/routes/properties.routes")(app);
require('./app/routes/tickets.routes')(app);

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

require('./app/routes/uploadimage.routes')(app);

// app.use('/api/uploads', express.static(path.join(__dirname, './app/public/completedTicketImages')) )

app.use("/api", otpRoutes); // Use OTP routes


const path = require("path");
const { title } = require("process");
const messaging = require("./firebaseConfig");
const { body } = require("express-validator");
// Serve static files from the 'public' directory
app.use("/public", express.static(path.join(__dirname, "app", "public")));

// set port, listen for requests
// const PORT = process.env.PORT || 8080;
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});