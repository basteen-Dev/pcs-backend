const messaging = require("../../firebaseConfig");
const db = require("../models");
const Ticketcmt = db.ticketcmds;
const user = db.user;
const tickets = db.tickets;
const { Op } = require('sequelize');

exports.findAllCmts = (req, res) => {
  Ticketcmt.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving comments."
      });
    });
};


// ------------------------------------------------------------------------------
// TO CREATE TICKET COMMENTS  
// ------------------------------------------------------------------------------

exports.CreateTicketComments = async (req, res) => {

  const { ticket_id, ticket_comments, user_id } = req.body;



  if (!ticket_id || !ticket_comments) {

    return res.status(404).json({
      isError: true,
      message: "ticket_id or ticket_comments are required.",
    });

  }

  try {

    const newComments = await Ticketcmt.create({
      new_comment: ticket_comments,
      ticket_id: ticket_id,
      user_id,
      isviewed: 0,
    });

    // console.log("data: ", newComments);

    if (!newComments) {
      return res.status(500).json({
        isError: true,
        message: "Failed to create comments",
      });
    }


    const ticketData = await tickets.findOne({
      where: { id: ticket_id }
    });

    const isManager = ticketData?.manager_id === user_id;
    const isAttender = ticketData?.attender_id === user_id;
    var user_ids = [];

    if (isManager) {

      user_ids.push(ticketData?.attender_id);

    } else if (isAttender) {

      user_ids.push(ticketData?.manager_id);

    } else if (!isManager && !isAttender) {

      user_ids.push(ticketData?.attender_id);
      user_ids.push(ticketData?.manager_id);

    }

    console.log("idsss:", user_ids);

    for (var ids of user_ids) {


      const userData = await user.findOne(
        { where: { id: ids } }
      );


      console.log("dkjsbdkjsbdsds: ", userData);
      console.log("dkjsbdkjsbdsds1111111111111111111: ", userData?.device_id != null);
      console.log("dkjsbdkjsbdsds22222222222222222222: ", userData?.device_id !== null);
      console.log("dkjsbdkjsbdsds22222222222222222222: ", userData?.device_id);


      if (userData?.device_id !== null) {

        console.log("con satify", userData?.device_id);

        const message = {
          "token": userData?.device_id,
          "notification": {
            "body": ticket_comments,
            "title": (!isManager && !isAttender) ? "Admin" : "User or Manager",
          },
          "android": {
            "priority": "high"
          },
        };

        const response = await messaging.send(message);
        console.log("push send ", response);
      }
    }



    return res.status(201).json({
      isError: false,
      message: "successfully comments are created",
    });


  } catch (e) {
    console.log("error on create tickets comments by id:", e);

    res.status(500).send({
      message: 'Error Create comments',
    });
  }
}

// ------------------------------------------------------------------------------
// TO GET TICKET COMMENTS  
// ------------------------------------------------------------------------------

exports.onGetTicketComments = async (req, res) => {

  const { ticket_id, user_id } = req.body;

  // console.log("user id", comments.user_id);
  console.log("jhsjdbsajhbasjdsa:", req.body);


  if (!ticket_id) {

    return res.status(404).json({
      isError: true,
      message: "ticket_id and user_id are required.",
    });

  }

  try {

    const comments = await Ticketcmt.findAll({
      include: [
        {
          model: user,
          as: 'userDetails',
          attributes: ['id', 'username', 'createdAt']
        },
      ],
      where: { ticket_id },
      order: [['createdAt', 'ASC']]
    });

    // console.log("user id", comments);

    // const userDetails = await user.findOne({ where: { id: comments.user_id } })

    // console.log("user details", userDetails);

    return res.status(200).json({
      isError: false,
      message: "",
      comments,
      // userDetails,
    });


  } catch (e) {
    console.log("error on get tickets comments by id:", e);

    res.status(500).send({
      message: 'Error retrieving Ticket Comments',
    });
  }
}

// ------------------------------------------------------------------------------
// TO GET COMMENTS NOTIFY  
// ------------------------------------------------------------------------------

exports.onGetCommentsNotify = async (req, res) => {

  const { user_id, role } = req.body;

  // console.log("user id", comments.user_id);
  console.log("jhsjdbsajhbasjdsa:", req.body);


  if (!user_id || !role) {

    return res.status(404).json({
      isError: true,
      message: "user_id and role are required.",
    });

  }

  try {

    if (role === "ROLE_ATTENDER") {

      const comments = await Ticketcmt.findAll({
        include: [
          {
            model: user,
            as: 'userDetails',
            attributes: ['id', 'username', 'createdAt'],
            where: { id: { [Op.ne]: user_id } }
          },
          {
            model: tickets,
            as: 'ticketDetails',
            attributes: ['id', 'createdAt', 'manager_id', 'attender_id'],
            where: { attender_id: user_id }
          },
        ],
        where: {
          isviewed: 0,
        },
        order: [['createdAt', 'DESC']]
      })

      console.log("user id", comments);

      return res.status(200).json({
        isError: false,
        message: "",
        comments,
        // userDetails,
      });
    } else if (role === "ROLE_MANAGER") {

      const comments = await Ticketcmt.findAll({
        include: [
          {
            model: user,
            as: 'userDetails',
            attributes: ['id', 'username', 'createdAt'],
            where: { id: { [Op.ne]: user_id } }
          },
          {
            model: tickets,
            as: 'ticketDetails',
            attributes: ['id', 'createdAt', 'manager_id', 'attender_id'],
            where: { manager_id: user_id }
          },
        ],
        where: {
          isviewed: 0,
        },
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        isError: false,
        message: "",
        comments,
      });
    }
    else if (role === "ROLE_ADMIN") {

      const comments = await Ticketcmt.findAll({
        include: [
          {
            model: user,
            as: 'userDetails',
            attributes: ['id', 'username', 'createdAt'],
            where: { id: { [Op.ne]: user_id } }
          },
          {
            model: tickets,
            as: 'ticketDetails',
            attributes: ['id', 'createdAt', 'manager_id', 'attender_id'],
          },
        ],
        where: {
          isviewed: 0,
        },
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        isError: false,
        message: "",
        comments,
      });
    }

    else {
      return res.status(404).json({
        isError: true,
        message: "Invalid role",
      });
    }


  } catch (e) {
    console.log("error on get tickets comments by id:", e);

    res.status(500).send({
      message: 'Error retrieving Ticket Comments',
    });
  }
}

// ------------------------------------------------------------------------------
// TO GET COMMENTS NOTIFY COUNT
// ------------------------------------------------------------------------------

exports.onGetCommentsNotifyCount = async (req, res) => {

  const { user_id, role } = req.body;

  // console.log("user id", comments.user_id);
  console.log("jhsjdbsajhbasjdsa:", req.body);


  if (!user_id || !role) {

    return res.status(404).json({
      isError: true,
      message: "user_id and role are required.",
    });

  }

  try {

    if (role === "ROLE_ATTENDER") {

      const comments = await Ticketcmt.findAll({
        include: [
          {
            model: user,
            as: 'userDetails',
            attributes: ['id', 'username', 'createdAt'],
            where: { id: { [Op.ne]: user_id } }
          },
          {
            model: tickets,
            as: 'ticketDetails',
            attributes: ['id', 'createdAt', 'manager_id', 'attender_id'],
            where: { attender_id: user_id }
          },
        ],
        where: {
          isviewed: 0,
        },
        order: [['createdAt', 'DESC']]
      })

      console.log("user id", comments);

      return res.status(200).json({
        isError: false,
        message: "",
        count: Array.isArray(comments) ? comments.length : 0,
        // userDetails,
      });
    } else if (role === "ROLE_MANAGER") {

      const comments = await Ticketcmt.findAll({
        include: [
          {
            model: user,
            as: 'userDetails',
            attributes: ['id', 'username', 'createdAt'],
            where: { id: { [Op.ne]: user_id } }
          },
          {
            model: tickets,
            as: 'ticketDetails',
            attributes: ['id', 'createdAt', 'manager_id', 'attender_id'],
            where: { manager_id: user_id }
          },
        ],
        where: {
          isviewed: 0,
        },
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        isError: false,
        message: "",
        count: Array.isArray(comments) ? comments.length : 0,
      });
    }
    else if (role === "ROLE_ADMIN") {

      const comments = await Ticketcmt.findAll({
        include: [
          {
            model: user,
            as: 'userDetails',
            attributes: ['id', 'username', 'createdAt'],
            where: { id: { [Op.ne]: user_id } }
          },
          {
            model: tickets,
            as: 'ticketDetails',
            attributes: ['id', 'createdAt', 'manager_id', 'attender_id'],
          },
        ],
        where: {
          isviewed: 0,
        },
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        isError: false,
        message: "",
        count: Array.isArray(comments) ? comments.length : 0,
      });
    }

    else {
      return res.status(404).json({
        isError: true,
        message: "Invalid role",
      });
    }


  } catch (e) {
    console.log("error on get tickets comments by id:", e);

    res.status(500).send({
      message: 'Error retrieving Ticket Comments',
    });
  }
}


// ------------------------------------------------------------------------------
// TO UPDATE TICKET COMMENTS STATUS  
// ------------------------------------------------------------------------------

exports.onUpdateCommentsStatus = async (req, res) => {

  const { ticket_id, ticket_comment_id, user_id, role } = req.body;

  // console.log("user id", comments.user_id);
  console.log("jhsjdbsajhbasjdsa:", req.body);


  if (!ticket_comment_id) {

    return res.status(404).json({
      isError: true,
      message: "ticket_comment_id are required.",
    });

  }

  try {

    var comments;

    // if (role === "ROLE_ATTENDER") {
    comments = await Ticketcmt.findAll({
      include: [

        {
          model: tickets,
          as: 'ticketDetails',
          attributes: ['id', 'createdAt', 'manager_id', 'attender_id'],
          // where: { attender_id: { [Op.ne]: user_id } }  // to check same user
        },
      ],
      where: {
        isviewed: 0,
        ticket_id,
        id: { [Op.lte]: ticket_comment_id }
      },
      order: [['createdAt', 'DESC']]
    });

    // } else if (role === "ROLE_MANAGER") {
    //   comments = await Ticketcmt.findAll({
    //     include: [
    //       {
    //         model: user,
    //         as: 'userDetails',
    //         attributes: ['id', 'username', 'createdAt']
    //       },
    //       {
    //         model: tickets,
    //         as: 'ticketDetails',
    //         attributes: ['id', 'createdAt', 'manager_id', 'attender_id'],
    //         // where: { manager_id: { [Op.ne]: user_id } }  // to check same user
    //       },
    //     ],
    //     where: {
    //       isviewed: 0,
    //       id: { [Op.lte]: ticket_comment_id }
    //     },
    //     order: [['createdAt', 'DESC']]
    //   });

    // }

    console.log("logssssss", comments);

    if (Array.isArray(comments)) {

      for (var val of comments) {


        await Ticketcmt.update(
          {
            isviewed: 1
          }
          , {
            where: { id: val?.id },
          }
        );

      }
    }

    return res.status(200).json({
      isError: false,
      message: "Comments status are updated successfully",
    });

    // if (comments.length > 0) {
    //   return res.status(200).json({
    //     isError: false,
    //     message: "Comments status are updated successfully",
    //   });
    // } else {
    //   return res.status(200).json({
    //     isError: false,
    //     message: "Comments status are already updated successfully",
    //   });
    // }


  } catch (e) {
    console.log("error on get tickets comments by id:", e);

    res.status(500).send({
      message: 'Error retrieving Ticket Comments',
    });
  }
}







