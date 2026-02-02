module.exports = (sequelize, Sequelize) => {
    const Department = sequelize.define("departments", {
      brand_name: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.INTEGER
      },
      department_active_status: {
        type: Sequelize.INTEGER
      }
    },{
        timestamps: true, // Adds createdAt and updatedAt automatically.
        tableName: 'departments' // Optional: Customize table name
      });

    return Department;
  };