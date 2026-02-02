const db = require("../models");
const ServiceType = db.servicetypes;
const Op = db.Sequelize.Op;

// exports.create = (req, res) => {
//     // Validate request
//     if (!req.body.service_name) {
//       res.status(400).send({
//         message: "Content can not be empty!"
//       });
//       return;
//     }
  
//     // Create a Service Type
//     const servicetype = {
//         service_name: req.body.service_name,
//         // published: req.body.published ? req.body.published : false
//     };
  
//     // Save Service Type in the database
//     ServiceType.create(req.body)
//       .then(data => {
//         res.send(data);
//       })
//       .catch(err => {
//         res.status(500).send({
//           message:
//             err.message || "Some error occurred while creating the Service Type."
//         });
//       });
//   };

// Create
exports.create = (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

const { service_name,department_id} = req.body;
const services = {
  service_name: service_name || null,
  department_id: department_id || null,

};

  // Save
  ServiceType.create(services)
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


//   ==============================================================
// Retrieve all Service Type from the database.

exports.findAll = (req, res) => {
  ServiceType.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Service Types."
      });
    });
};

//   ==========================================================
// Find a single Service Type with an id

exports.findOne = (req, res) => {
    const id = req.params.id;
  
    ServiceType.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Service Type with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Service Type with id=" + id
        });
      });
  };

//   ====================================================
// Update a Service Type by the id in the request

exports.update = (req, res) => {
    const id = req.params.id;

    ServiceType.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Service Type was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Service Type with id=${id}. Maybe Service Type was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Service Type with id=" + id
        });
      });
  };

//   ==================================================
// Delete a Service Type with the specified id in the request

exports.delete = (req, res) => {
    const id = req.params.id;
  
    ServiceType.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Service Type was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete Service Type with id=${id}. Maybe Service Type was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Service Type with id=" + id
        });
      });
  };

//   ==================================================
