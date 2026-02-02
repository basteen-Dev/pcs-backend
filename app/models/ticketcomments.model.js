module.exports = (sequelize, Sequelize) => {
  const TicketCmt = sequelize.define("ticketcmds", {
    new_comment: {
      type: Sequelize.STRING,
    },
    ticket_id: {
      type: Sequelize.INTEGER,
    },
    comment_date: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW, // Automatically set to the current timestamp
      allowNull: false
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    isviewed: {
      type: Sequelize.INTEGER,
    }

  }, {
    timestamps: true, // Adds createdAt and updatedAt automatically.
    tableName: 'ticketcmds' // Optional: Customize table name
  });

  return TicketCmt;
};