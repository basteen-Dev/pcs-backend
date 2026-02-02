const express = require("express");
const router = express.Router();
const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");


module.exports = function (app) {

  const pcsusers = require("../controllers/user.controller.js");

  var router = require("express").Router();

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", controller.allAccess);

  // Fix the route
  router.get("/", pcsusers.findAll);
  router.delete("/:id", pcsusers.delete);

  router.get("/getUserDetails", pcsusers.getUserById);

  app.use('/api/pcsusers', router);


  app.get(
    "/api/test/user",
    [authJwt.verifyToken],
    controller.userBoard
  );

  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );


};


// ================== this is new changes ========================
// const express = require("express");
// const router = express.Router();
// const { authJwt } = require("../middleware");
// const pcsusers = require("../controllers/user.controller.js");

// // Middleware to handle CORS
// module.exports = function(app) {
//   app.use(function(req, res, next) {
//     res.header(
//       "Access-Control-Allow-Headers",
//       "x-access-token, Origin, Content-Type, Accept"
//     );
//     next();
//   });

//   // Public routes
//   router.get("/", pcsusers.findAll); // ✅ This correctly maps to /api/pcsusers
//   router.delete("/:id", pcsusers.delete);
//   router.get("/getRoles", [authJwt.verifyToken], pcsusers.getRoles);

//   // Role-based access routes
//   router.get("/test/all", pcsusers.allAccess);
//   router.get("/test/user", [authJwt.verifyToken], pcsusers.userBoard);
//   router.get("/test/mod", [authJwt.verifyToken, authJwt.isModerator], pcsusers.moderatorBoard);
//   router.get("/test/admin", [authJwt.verifyToken, authJwt.isAdmin], pcsusers.adminBoard);

//   // Attach router to main Express app
//   app.use('/api/pcsusers', router);
// };

// ================== this is new changes ends ========================