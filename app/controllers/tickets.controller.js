const db = require("../models");
const Ticket = db.tickets;
const property = db.properties;
const department = db.departments;
const service = db.servicetypes;
const Ticketcmt = db.ticketcmds;
const TicketsStatusLogs = db.ticketsStatusLogs;
const user = db.user;
const Op = db.Sequelize.Op;

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { validationResult } = require("express-validator");
const { error } = require("console");
const { where } = require("sequelize");
const messaging = require("../../firebaseConfig");
const { sendNotification } = require("../components/send_notification_compo");

// Set up storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../public/feedbackimages");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `feedbackImage_${Date.now()}.png`);
  },
});

// Set up file filter and limits
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
}).single("feedback_image");

// =============== save tickets ==========
exports.create = async (req, res) => {
  console.log("comes here -01");

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send({ message: "Content cannot be empty!" });
  }

  try {
    const {
      name,
      phone_no,
      room_no,
      department_cat_id,
      service_type_id,
      discription,
      property_id,
      feedback_image,
    } = req.body;

    console.log(req.body);
    // const feedback_image = req.file ? req.file.filename : null;
    const ticket_date = new Date().toISOString().split("T")[0];

    const filterdAttender = await user.findOne({
      where: {
        department_id: department_cat_id,
        property_id: property_id,
        user_role: 1,
      },
    });

    const filterdManager = await user.findOne({
      where: { property_id, user_role: 2 },
    });

    const filterdAdmin = await user.findOne({
      where: { user_role: 3 }
    });

    if (!filterdManager) {
      return res.status(404).send({
        message:
          "There is no manager for this property. Please create a manager for this property.",
      });
    }

    // Create the initial record
    const newTicket = await Ticket.create({
      name,
      phone_no,
      room_no,
      department_cat_id,
      service_type_id,
      discription,
      feedback_image,
      manager_id: filterdManager?.id,
      property_id,
      ticket_date,
      status: filterdAttender?.id ? 1 : 0,
      attender_id: filterdAttender?.id && null,
    });

    if (!newTicket) {
      return res.status(500).send({ message: "Failed to create record" });
    }

    await TicketsStatusLogs.create({
      ticket_id: newTicket?.id,
      old_status: newTicket?.status,
      new_status: newTicket?.status,

    });

    if (filterdAttender?.device_id !== null) {
      sendNotification(
        filterdAttender?.device_id,
        `Complaint registered for Room No. ${room_no} by ${name}. Please check and resolve at the earliest.`,
        "New Room Complaint"
      );

    }

    if (filterdManager?.device_id !== null) {
      sendNotification(
        filterdManager?.device_id,
        `Complaint registered for Room No. ${room_no} by ${name}. Please check and resolve at the earliest.`,
        "New Room Complaint"
      );
    }

    res.status(200).json({
      message: "success",
      // filterdAttender,
      // filterdManager,
      ticketId: newTicket.id,
      feedback_image: feedback_image
        ? `/public/feedbackimages/${feedback_image}`
        : null,
    });
  } catch (error) {
    console.error("Error /ticket:", error);
    res.status(500).send({
      message: error.message || "Some error occurred while creating the record",
    });
  }
};

// ===========================
// // Save image only if provided
// let dfImagePath = null;
// if (feedback_image) {
//   const fdImageName = `feedbackImage_${newTicket.id}.png`;
//   dfImagePath = path.join(__dirname, "../public/feedbackimages", fdImageName);

//   // Ensure the directory exists
//   if (!fs.existsSync(path.dirname(dfImagePath))) {
//     fs.mkdirSync(path.dirname(dfImagePath), { recursive: true });
//   }

//   // Decode base64 image if necessary
//   const imageBuffer = Buffer.from(feedback_image, "base64"); // Ensure image is properly encoded
//   fs.writeFileSync(dfImagePath, imageBuffer);

//   // Update the record with the image path
//   await Ticket.update({ feedback_image:fdImageName }, { where: { id: newTicket.id } });
// }
// ===========================

// =======  get all the tickets ===
// Retrieve all
exports.findAll = (req, res) => {
  Ticket.findAll()
    .then((data) => {
      var ticketData = data?.map((value, index, array) => {
        const complainImg =
          value?.feedback_image !== null
            ? `${req.protocol}://${req.get("host")}` + value?.feedback_image
            : "";
        const completionImg =
          value?.completion_image !== null
            ? `${req.protocol}://${req.get("host")}` + value?.completion_image
            : "";

        const returnData = {
          ...value.dataValues,
          feedback_image: complainImg,
          completion_image: completionImg,
        };

        return returnData;
      });

      res.send(ticketData);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving records.",
      });
    });
};

// =========== get the all records using like =====
exports.findLike = async (req, res) => {
  try {
    const { name, phone_no, id } = req.query;

    let condition = {};
    if (name) condition.name = { [Op.iLike]: `%${name}%` };
    if (phone_no) condition.phone_no = { [Op.iLike]: `%${phone_no}%` };
    if (id) condition.id = id;

    const data = await Ticket.findAll({ where: condition });

    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving records.",
    });
  }
};

// ======= get single ticket ==========

exports.findOne = (req, res) => {
  const id = req.params.id;

  Ticket.findByPk(id)
    .then(async (ticketData) => {
      if (ticketData) {
        const _ticketStatusLogs = await TicketsStatusLogs.findAll({
          where: { ticket_id: ticketData?.id },
          include: [
            {
              model: user,
              as: "userDetails",
              attributes: ["id", "username", "createdAt"],
            },
          ],
        });

        const feedback_image = ticketData?.feedback_image
          ? `${req.protocol}://${req.get("host")}` + ticketData?.feedback_image
          : null;

        const completion_image = ticketData?.completion_image
          ? `${req.protocol}://${req.get("host")}` +
          ticketData?.completion_image
          : null;

        const data = {
          ...ticketData.dataValues,
          feedback_image,
          completion_image,
        };

        res.send({ data, _ticketStatusLogs });
      } else {
        res.status(404).send({
          message: `Ticket with id=${id} not found.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving Ticket with id=${id}`,
      });
    });
};

// ------------------------------------------------------------------------------
// to display ticket on mobile dashboard
// ------------------------------------------------------------------------------

exports.dashboardTickets = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "user_id and role are required" });
  }

  try {
    let tickets;

    if (req?.body?.role === "ROLE_ATTENDER") {
      tickets = await Ticket.findAll({
        where: { attender_id: req?.body?.user_id },
        include: [
          {
            model: property,
            as: "property",
            attributes: ["id", "name"],
          },
          {
            model: department,
            as: "departments",
            attributes: ["id", "brand_name", "department_active_status"],
          },
          {
            model: service,
            as: "servicetypes",
            attributes: ["id", "service_name", "department_id"],
          },
        ],
        limit: 10,
        order: [["createdAt", "DESC"]],
      });
    } else if (req?.body?.role === "ROLE_MANAGER") {
      tickets = await Ticket.findAll({
        where: { manager_id: req?.body?.user_id },
        include: [
          {
            model: property,
            as: "property",
            attributes: ["id", "name"],
          },
          {
            model: department,
            as: "departments",
            attributes: ["id", "brand_name", "department_active_status"],
          },
          {
            model: service,
            as: "servicetypes",
            attributes: ["id", "service_name", "department_id"],
          },
        ],
        limit: 10,
        order: [["createdAt", "DESC"]],
      });
    } else {
      tickets = await Ticket.findAll({
        include: [
          {
            model: property,
            as: "property",
            attributes: ["id", "name"],
          },
          {
            model: department,
            as: "departments",
            attributes: ["id", "brand_name", "department_active_status"],
          },
          {
            model: service,
            as: "servicetypes",
            attributes: ["id", "service_name", "department_id"],
          },
        ],
        limit: 10,
        order: [["createdAt", "DESC"]],
      });
    }

    return res.status(200).json(tickets);
  } catch (e) {
    console.log("error on get tickets by id:", e);

    res.status(500).send({
      message: "Error retrieving Ticket",
    });
  }
};

// ------------------------------------------------------------------------------
// to web dashboard
// ------------------------------------------------------------------------------

exports.webDashboardTickets = async (req, res) => {
  try {
    let topTentickets = await Ticket.findAll({
      include: [
        {
          model: property,
          as: "property",
          attributes: ["id", "name"],
        },
        {
          model: department,
          as: "departments",
          attributes: ["id", "brand_name", "department_active_status"],
        },
        {
          model: service,
          as: "servicetypes",
          attributes: ["id", "service_name", "department_id"],
        },
      ],
      limit: 10,
      order: [["createdAt", "DESC"]],
    });

    let allTickets = await Ticket.findAll();
    let allProperties = await property.findAll();
    let allDepartments = await department.findAll();
    let allCommentsNotify = await Ticketcmt.findAll({
      where: {
        isviewed: 0,
      },
    });

    const response = {
      tickets: topTentickets,
      ticket_count: allTickets.length,
      department_count: allDepartments.length,
      properties_count: allProperties.length,
      notifications_count: allCommentsNotify.length,
    };

    return res.status(200).json(response);
  } catch (e) {
    console.log("error on get tickets by id:", e);

    res.status(500).send({
      message: "Error retrieving Ticket",
    });
  }
};

// ########################################################
// all tickets by user role controller
// ########################################################

exports.tickets = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "user_id and role are required" });
  }

  try {
    let tickets;

    if (req?.body?.role === "ROLE_ATTENDER") {
      tickets = await Ticket.findAll({
        where: { attender_id: req?.body?.user_id },
        include: [
          {
            model: property,
            as: "property",
            attributes: ["id", "name"],
          },
          {
            model: department,
            as: "departments",
            attributes: ["id", "brand_name", "department_active_status"],
          },
          {
            model: service,
            as: "servicetypes",
            attributes: ["id", "service_name", "department_id"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else if (req?.body?.role === "ROLE_MANAGER") {
      tickets = await Ticket.findAll({
        where: { manager_id: req?.body?.user_id },
        include: [
          {
            model: property,
            as: "property",
            attributes: ["id", "name"],
          },
          {
            model: department,
            as: "departments",
            attributes: ["id", "brand_name", "department_active_status"],
          },
          {
            model: service,
            as: "servicetypes",
            attributes: ["id", "service_name", "department_id"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else {
      tickets = await Ticket.findAll({
        include: [
          {
            model: property,
            as: "property",
            attributes: ["id", "name"],
          },
          {
            model: department,
            as: "departments",
            attributes: ["id", "brand_name", "department_active_status"],
          },
          {
            model: service,
            as: "servicetypes",
            attributes: ["id", "service_name", "department_id"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    return res.status(200).json(tickets);
  } catch (e) {
    console.log("error on get tickets by id:", e);

    res.status(500).send({
      message: "Error retrieving Ticket",
    });
  }
};

// ########################################################
// tickets details controller
// ########################################################

exports.ticketsDetails = async (req, res) => {
  const { ticket_id } = req.body;

  try {
    if (!ticket_id) {
      return res.status(404).json({
        isError: true,
        message: "ticket_id is required",
      });
    }

    var ticketsDetails = await Ticket.findOne({
      where: { id: ticket_id },
      include: [
        {
          model: property,
          as: "property",
          attributes: ["id", "name", "city"],
        },
        {
          model: department,
          as: "departments",
          attributes: ["id", "brand_name", "department_active_status"],
        },
        {
          model: service,
          as: "servicetypes",
          attributes: ["id", "service_name", "department_id"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log("gacsagdcsads:", ticketsDetails?.dataValues);

    const feedback_image = ticketsDetails.dataValues.feedback_image
      ? `${req.protocol}://${req.get("host")}` +
      ticketsDetails.dataValues.feedback_image
      : null;

    const completion_image = ticketsDetails.dataValues.completion_image
      ? `${req.protocol}://${req.get("host")}` +
      ticketsDetails.dataValues.completion_image
      : null;

    const _ticketsDetails = {
      ...ticketsDetails.dataValues,
      feedback_image,
      completion_image,
    };

    console.log("dvsdvsad:", _ticketsDetails);

    // _ticketsDetails.dataValues.map((value, index, array) => {

    //   return { ...value, feedback_image, completion_image };

    // })

    const _ticketStatusLogs = await TicketsStatusLogs.findAll({
      where: { ticket_id: ticket_id },
      include: [
        {
          model: user,
          as: "userDetails",
          attributes: ["id", "username", "createdAt"],
        },
      ],
    });

    return res.status(200).json({
      isError: false,
      message: "",
      _ticketsDetails,
      _ticketStatusLogs,
    });
  } catch (e) {
    console.log("error on get tickets by id:", e);

    res.status(500).send({
      message: "Error retrieving Ticket",
    });
  }
};

// ########################################################
// update tickets status controller
//
// notes:
//   ticket status
//        0 : Open
//        1 : Assigned
//        2 : InProgress
//        3 : closed or completed
// ########################################################

exports.onUpdateStatus = async (req, res) => {
  const { user_id, ticket_id, ticket_status, image_url, ticket_des } = req.body;

  if (!ticket_id || !user_id) {
    return res.status(404).json({
      isError: true,
      message: "ticket_id or user_id are required.",
    });
  }

  try {
    const ticketDetail = await Ticket.findOne({
      where: { id: ticket_id },
    });

    if (ticketDetail?.status == 1) {
      await TicketsStatusLogs.create({
        ticket_id,
        old_status: ticketDetail?.status,
        new_status: 2,
        changed_by: user_id,
      });

      const [updated] = await Ticket.update(
        { status: 2 },
        {
          where: { id: ticket_id },
        }
      );

      // console.log("ldhsjdskdsd:", ticketStatusLog);

      if (updated) {
        return res.status(201).json({
          isError: false,
          message: "Ticker status are updated successfully",
        });
      } else {
        return res.status(200).json({
          isError: true,
          message: "Issue on updating ticket status",
        });
      }
    } else if (ticketDetail?.status == 2) {
      if (!image_url || !ticket_des) {
        return res.status(200).json({
          isError: true,
          message: "image_url or ticket_des are required",
        });
      }

      await TicketsStatusLogs.create({
        ticket_id,
        old_status: ticketDetail?.status,
        new_status: 3,
        changed_by: user_id,
      });

      const [updated] = await Ticket.update(
        {
          status: 3,
          attender_description: ticket_des,
          completion_image: image_url,
        },
        {
          where: {
            id: ticket_id,
          },
        }
      );

      console.log("log", updated);

      if (updated) {
        return res.status(201).json({
          isError: false,
          message: "Ticket Closed successfully",
        });
      } else {
        return res.status(200).json({
          isError: true,
          message: "Issue on closing ticket",
        });
      }
    } else if (ticketDetail?.status == 3) {
      return res.status(200).json({
        isError: false,
        message: "This ticket already closed",
      });
    }
  } catch (e) {
    console.log("error on get tickets by id:", e);

    res.status(500).send({
      isError: false,
      message: "Error retrieving Ticket",
    });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { add_new_comments, manager_id, attender_id, user_id } = req.body;

  try {
    let updateData = { manager_id };


    const ticket = await Ticket.findOne({
      where: { id: id }
    });

    // Step 1: Check if attender_id is valid (not null, 0, or undefined), then update status = 1
    if (
      attender_id !== null &&
      attender_id !== undefined &&
      attender_id !== 0
    ) {

      if (ticket.status !== 3) {

        updateData.attender_id = attender_id;
        updateData.status = 1;

        const filterdAttender = await user.findOne({
          where: { id: attender_id },
        });

        sendNotification(
          filterdAttender?.device_id,
          `Complaint registered for Room No. ${room_no} by ${name}. Please check and resolve at the earliest.`,
          "New Complaint Assigned"
        );
      } else {

        return res.status(200).json({
          isError: true,
          message: "This ticket is already closed, unable to reassign.",
        });

      }

    }

    // Step 2: Update the ticket with the required fields
    const [updatedRows] = await Ticket.update(updateData, { where: { id } });

    await TicketsStatusLogs.create({
      ticket_id: id,
      old_status: 0,
      new_status: 1,
      changed_by: user_id,
    });

    if (updatedRows === 0) {
      return res
        .status(404)
        .send({ message: `Ticket with id=${id} not found.` });
    }

    // Step 3: Check if add_new_comments is valid (not empty, null, or undefined), then insert into Ticketcmt table
    if (
      add_new_comments !== null &&
      add_new_comments !== undefined &&
      add_new_comments.trim() !== ""
    ) {
      await Ticketcmt.create({
        master_id: id,
        name: "", // You can modify this field as needed
        add_new_comments: add_new_comments,
        date: new Date(), // Store the current date and time
      });
    }

    res.send({ message: "Ticket updated successfully." });
  } catch (err) {
    console.error("Error updating Ticket:", err);
    res.status(500).send({ message: `Error updating Ticket with id=${id}` });
  }
};
exports.findAllCmts = (req, res) => {
  const { ticket_id } = req.query; // Get ticket_id from query params

  let condition = ticket_id ? { ticket_id: ticket_id } : null;

  Ticketcmt.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving comments.",
      });
    });
};
