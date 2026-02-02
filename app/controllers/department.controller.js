const db = require("../models");
const Department = db.departments;
const Op = db.Sequelize.Op;




// Create
exports.create = (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).send({
          message: "Content can not be empty!"
        });
        return;
      }

const { brand_name} = req.body;
const { department_active_status} = req.body;
const department = {
  brand_name: brand_name || null,
  department_active_status: department_active_status || null
};

    // Save
    Department.create(department)
      .then(data => {
        res.status(200).send({
         message: "success"
        });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating"
        });
      });
  };


// =============================

// exports.create = (req, res) => {
//     // Validate request
//     if (!req.body.brand_name) {
//       res.status(400).send({
//         message: "Content can not be empty!"
//       });
//       return;
//     }
  
//     // Create a Department
//     const department = {
//         brand_name: req.body.brand_name,
//         // published: req.body.published ? req.body.published : false
//     };
  
//     // Save Department in the database
//     Department.create(department)
//       .then(data => {
//         res.send(data);
//       })
//       .catch(err => {
//         res.status(500).send({
//           message:
//             err.message || "Some error occurred while creating the Department."
//         });
//       });
//   };

//   ==============================================================
// Retrieve all Department from the database.

exports.findAll = (req, res) => {
    const brand_name = req.query.brand_name;

    let condition = {
      department_active_status: 1, 
  };

    Department.findAll({ where: condition })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Departments."
        });
      });
  };

//   ==========================================================
// Find a single Department with an id

exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Department.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Department with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Department with id=" + id
        });
      });
  };

//   ====================================================
// Update a Department by the id in the request

exports.update = (req, res) => {
  const id = req.params.id;

  Department.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating"
      });
    });
};

//   ==================================================
// Delete a Department with the specified id in the request

exports.delete = (req, res) => {
  const id = req.params.id;

  Department.destroy({ where: { id: id } })

  
    .then((num) => {
      if (num === 1) {
        res.status(200).json({ success: true, message: "Deleted successfully!" }); 
      } else {
        res.status(400).json({ success: false, message: "Cannot delete. Record not found." }); 
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: "Could not delete. Server error." }); 
    });
};

//   ==================================================
