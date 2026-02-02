
const db = require("../models");
const Property = db.users;
const Role = db.role;
const Op = db.Sequelize.Op;
const user = db.user;

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

// ------------------------------

// exports.allAccess = async (req, res) => {
//   if (!req.body || Object.keys(req.body).length === 0) {
//     return res.status(400).send({ message: "Content cannot be empty!" });
//   }

//   try {
//     const { username, mobile_no, email,password,re_password, user_role, address_1, address_2, city, state_id, zip_code, emp_id } = req.body;

//     // Create the initial record
//     const newProperty = await Property.create({
//       username,
//       mobile_no,
//       email,
//       password,
//       re_password,
//       user_role,
//       address_1,
//       address_2,
//       city,
//       state_id,
//       zip_code,
//       emp_id,
//     });

//     if (!newProperty) {
//       return res.status(500).send({ message: "Failed to create record" });
//     }

//     res.status(200).send({
//       message: "success",
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send({ message: error.message || "Some error occurred while creating the record" });
//   }
// };
// =====================================================================

exports.findAll = (req, res) => {
  const username = req.query.username;
  var condition = username ? { username: { [Op.iLike]: `%${username}%` } } : null;

  Property.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving"
      });
    });
};
// =================================
exports.delete = (req, res) => {
  const id = req.params.id;

  Property.destroy({ where: { id: id } })


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

// =======================================

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

// ----------------------------------------------------------------





exports.getUserById = async (req, res) => {

  const { user_id } = req.body;

  if (!user_id) {

    return res.status(404).json({
      isError: true,
      message: "user_id are required.",
    });

  }

  try {

    const userData = await user.findOne({
      include: [
        // {
        //   model: property,
        //   as: 'property',
        //   attributes: ['id', 'name',]
        // },
      ],
      where: { "id": user_id, },
    });

    return res.status(200).json({
      isError: false,
      message: "",
      userData,
    });


  } catch (e) {
    console.log("error on get user by id:", e);

    res.status(500).send({
      message: 'Error retrieving Ticket Comments',
    });
  }
}


