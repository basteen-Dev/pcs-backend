
const db = require('../models');
const TicketStatusLog = db.ticketsStatusLogs;


// exports.getAllTicketStatus = async (req, res) => {

//     const { ticket_id, user_id } = req.body;

//     // console.log("user id", comments.user_id);


//     if (!ticket_id) {

//         return res.status(404).json({
//             isError: true,
//             message: "ticket_id and user_id are required.",
//         });

//     }

//     try {

//         const comments = await Ticketcmt.findAll({
//             include: [
//                 {
//                     model: user,
//                     as: 'userDetails',
//                     attributes: ['id', 'username', 'createdAt']
//                 },
//             ],
//             where: { ticket_id },
//             order: [['createdAt', 'ASC']]
//         });

//         console.log("user id", comments);

//         // const userDetails = await user.findOne({ where: { id: comments.user_id } })

//         // console.log("user details", userDetails);

//         return res.status(200).json({
//             isError: false,
//             message: "",
//             comments,
//             // userDetails,
//         });


//     } catch (e) {
//         console.log("error on get tickets comments by id:", e);

//         res.status(500).send({
//             message: 'Error retrieving Ticket Comments',
//         });
//     }

// }

