module.exports = (sequelize, Sequelize) => {
  const TicketStatusLogs = sequelize.define(
    "TicketsStatusLogs",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ticket_id: {
        type: Sequelize.INTEGER,
      },
      old_status: {
        type: Sequelize.INTEGER,
      },
      new_status: {
        type: Sequelize.INTEGER,
      },
      changed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: "ticketsStatusLogs",
    }
  );

  return TicketStatusLogs;
};
