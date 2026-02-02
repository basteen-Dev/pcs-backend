module.exports = (sequelize, Sequelize) => {
    const ServiceType = sequelize.define("servicetypes", {
      service_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    },{
        timestamps: true, // Adds createdAt and updatedAt automatically.
        tableName: 'servicetypes' // Optional: Customize table name
      });

    return ServiceType;
  };