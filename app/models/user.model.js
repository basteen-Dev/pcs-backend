module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING
    },
    mobile_no: {
      type: Sequelize.BIGINT,
      allowNull: false,
      unique: true,
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    re_password: {
      type: Sequelize.STRING
    },
    user_role: {
      type: Sequelize.INTEGER
    },

    address_1: {
      type: Sequelize.STRING
    },
    address_2: {
      type: Sequelize.STRING
    },
    city: {
      type: Sequelize.STRING
    },
    state_id: {
      type: Sequelize.INTEGER
    },
    zip_code: {
      type: Sequelize.STRING
    },
    emp_id: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.INTEGER
    },
    property_id: {
      type: Sequelize.INTEGER
    },
    department_id: {
      type: Sequelize.INTEGER
    },
    device_id: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: true, // Since created_at and updated_at are manually defined
    tableName: 'users'
  });

  return User;
};