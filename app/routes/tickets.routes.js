const { getTicketsByRoleValidations } = require("../validations/ticket_validations.js");
const { route } = require("./otp.routes.js");

module.exports = app => {
  const tickets = require("../controllers/tickets.controller.js");
  const ticketcmts = require("../controllers/ticketcomments.controller.js");

  var router = require("express").Router();

  // Create
  router.post("/", tickets.create);

  // Retrieve all
  router.get("/", tickets.findAll);

  // Retrieve tickets by user and role for dashboard
  router.get("/dashboardTickets", getTicketsByRoleValidations, tickets.dashboardTickets);

  // Retrieve tickets, notification, properties and department counts for web dashboard
  router.get("/webDashboardTickets", tickets.webDashboardTickets);

  // Retrieve tickets by user and role 
  router.get("/byRole", getTicketsByRoleValidations, tickets.tickets);

  // Retrieve tickets details by ticket id
  router.get("/ticketDetails", getTicketsByRoleValidations, tickets.ticketsDetails);

  // Retrieve all using like
  router.get("/findLike", tickets.findLike);

  // Retrieve all comments by user id
  router.post("/comments/comments-notify", ticketcmts.onGetCommentsNotify);

  // Retrieve all comments by user id
  router.post("/comments/comments-notify-count", ticketcmts.onGetCommentsNotifyCount);

  // Retrieve all comments by user id
  router.post("/comments/updateCommentsStatus", ticketcmts.onUpdateCommentsStatus);

  // Retrieve all comments by ticket id
  router.post("/comments/getAll", ticketcmts.onGetTicketComments);

  // Retrieve all comments by 
  router.get("/comments/:id", ticketcmts.findAllCmts);

  // create comments 
  router.post("/comments/create", ticketcmts.CreateTicketComments)

  // Retrieve a single with id
  router.get("/:id", tickets.findOne);

  // Update with id
  router.put("/:id", tickets.update);

  // to Update ticket status
  router.post("/updateTicketStatus", tickets.onUpdateStatus);


  app.use('/api/tickets', router);
};