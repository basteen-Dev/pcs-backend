module.exports = app => {
    const servicetypes = require("../controllers/servicetype.controller.js");
  
    var router = require("express").Router();
  
    // Create
    router.post("/", servicetypes.create);
  
    // Retrieve all
    router.get("/", servicetypes.findAll);
  
    // Retrieve a single with id
    router.get("/:id", servicetypes.findOne);
  
    // Update with id
    router.put("/:id", servicetypes.update);
  
    // Delete with id
    router.delete("/:id", servicetypes.delete);
  
    app.use('/api/servicetypes', router);
  };