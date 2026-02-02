const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/verify-user", controller.verifyUser);

  app.post("/api/auth/resend-otp", controller.resendOtp);


  // ========= other needed routes ====
  app.get("/api/auth/getAllRoles", controller.getAllRoles);
  app.get("/api/auth/findAllUsers", controller.findAllUsers);
  app.get("/api/auth/findUserById/:id", controller.findUserById);
  app.put("/api/auth/updateUser/:id", controller.updateUser);
  app.delete("/api/auth/deleteUser/:id", controller.deleteUser);
};