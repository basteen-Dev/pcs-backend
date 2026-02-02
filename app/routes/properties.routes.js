module.exports = app => {
    const property = require("../controllers/properties.controller.js");
  
    var router = require("express").Router();
  
    // Create
    router.post("/", property.create);
  
    // Retrieve all
    router.get("/", property.findAll);
  
    // Retrieve a single with id
    router.get("/:id", property.findOne);
  
    // Update with id
    router.put("/:id", property.update);
  
    // Delete with id
    router.delete("/:id", property.delete);
  
    app.use('/api/properties', router);
  };