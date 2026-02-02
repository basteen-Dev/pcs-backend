module.exports = app => {
    const departments = require("../controllers/department.controller.js");
  
    var router = require("express").Router();
  
    // Create
    router.post("/", departments.create);
  
    // Retrieve all
    router.get("/", departments.findAll);
  
    // Retrieve a single with id
    router.get("/:id", departments.findOne);
  
    // Update with id
    router.put("/:id", departments.update);
  
    // Delete with id
    router.delete("/:id", departments.delete);
  
    app.use('/api/departments', router);
  };