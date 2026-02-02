const db = require("../models");
const Property = db.properties;
const Op = db.Sequelize.Op;

const { v4: uuidv4 } = require("uuid"); // Import UUID for unique barcode
const bwipjs = require("bwip-js"); // npm install bwip-js

const fs = require("fs");
const path = require("path");



exports.create = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send({ message: "Content cannot be empty!" });
  }

  try {
    const { name, contact_person, contact_no, contact_email, address_1, address_2, city, state_id, zip_code, food_url, breakfast_date, breakfast_menu, lunch_date, lunch_menu, dinner_date, dinner_menu } = req.body;

    // Create the initial record
    const newProperty = await Property.create({
      name,
      contact_person,
      contact_no,
      contact_email,
      // user_role,
      address_1,
      address_2,
      city,
      state_id,
      zip_code,
      food_url,
      breakfast_date,
      breakfast_menu,
      lunch_date,
      lunch_menu,
      dinner_date,
      dinner_menu,
      qrcode_url: null,
      qrcode_encoded_link: null,
    });

    if (!newProperty) {
      return res.status(500).send({ message: "Failed to create record" });
    }

    // front link
    const qrcodeUrl = `/ticket/${newProperty.id}`;

    // Generate QR Code using bwip-js
    const qrCodeBuffer = await bwipjs.toBuffer({
      bcid: "qrcode", 
      text: qrcodeUrl, 
      scale: 6, 
      height: 30, 
      includetext: true, 
      textxalign: "center", 
    });

    // Define QR code image path
    const qrImageName = `qrcode_${newProperty.id}.png`;
    const qrImagePath = path.join(__dirname, "../public/qrcodes", qrImageName);

    // Ensure the directory exists
    if (!fs.existsSync(path.dirname(qrImagePath))) {
      fs.mkdirSync(path.dirname(qrImagePath), { recursive: true });
    }

    // Save QR code image to the file system
    fs.writeFileSync(qrImagePath, qrCodeBuffer);

    // Store the QR code image URL in the database
    const savedQrCodeUrl = `/public/qrcodes/${qrImageName}`;


    // Update the record with qrcode URL
    await Property.update({ qrcode_url: savedQrCodeUrl, qrcode_encoded_link: qrcodeUrl }, { where: { id: newProperty.id } });


    res.status(200).send({
      message: "success",
      qrcode_url: savedQrCodeUrl,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: error.message || "Some error occurred while creating the record" });
  }
};

//   ==============================================================
// Retrieve all

exports.findAll = (req, res) => {
  const service_name = req.query.service_name;
  var condition = service_name ? { service_name: { [Op.iLike]: `%${service_name}%` } } : null;

  Property.findAll({ where: condition })
    .then(data => {

      const propertyData = data;

      var responseData = propertyData?.map((value, index, array) => {
        var qrImg = `${req.protocol}://${req.get('host')}` + value?.qrcode_url;

        const returnData = { ...value.dataValues, qrcode_url: qrImg }

        return returnData;


      });


      res.send(responseData);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving"
      });
    });
};

//   ==========================================================
// Find a single

exports.findOne = (req, res) => {
  const id = req.params.id;

  Property.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving"
      });
    });
};

//   ====================================================
// Update

exports.update = (req, res) => {
  const id = req.params.id;

  Property.update(req.body, {
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
// Delete

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


//   ==================================================
