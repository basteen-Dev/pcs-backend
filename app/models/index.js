const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Use with caution; for self-signed certificates
    },
  },

  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.departments = require("./department.model.js")(sequelize, Sequelize);
db.servicetypes = require("./servicetype.model.js")(sequelize, Sequelize);
db.properties = require("./properties.model.js")(sequelize, Sequelize);
db.tickets = require("./tickets.model.js")(sequelize, Sequelize);
db.ticketcmds = require("./ticketcomments.model.js")(sequelize, Sequelize);
db.ticketsStatusLogs = require("./ticket_status_logs.model.js")(sequelize, Sequelize);

// for user authentication

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles"
});
db.user.belongsToMany(db.role, {
  through: "user_roles"
});

// for OTP 

db.otp = require("../models/otp_tabel.model.js")(sequelize, Sequelize);



// ############################################################
//  one-to-one relationship for property-to=ticket
// ############################################################

db.tickets.belongsTo(db.properties, {
  foreignKey: 'property_id',
  as: 'property',
});

db.properties.hasMany(db.tickets, {
  foreignKey: 'property_id',
});


// ############################################################
//  one-to-one relationship for department-to-ticket
// ############################################################

db.tickets.belongsTo(db.departments, {
  foreignKey: 'department_cat_id',
  as: 'departments',
});

db.departments.hasMany(db.tickets, {
  foreignKey: 'department_cat_id',
})


// ############################################################
//  one-to-one relationship for services-to-ticket
// ############################################################

db.tickets.belongsTo(db.servicetypes, {
  foreignKey: 'service_type_id',
  as: 'servicetypes',
});

db.servicetypes.hasMany(db.tickets, {
  foreignKey: 'service_type_id',
});

// ############################################################
//  one-to-one relationship for user-to-ticketComments
// ############################################################

db.ticketcmds.belongsTo(db.user, {
  foreignKey: 'user_id',
  as: 'userDetails',
});

db.user.hasMany(db.ticketcmds, {
  foreignKey: 'user_id',
})

// ############################################################
//  one-to-one relationship for ticket-to-ticketComments
// ############################################################

db.ticketcmds.belongsTo(db.tickets, {
  foreignKey: 'ticket_id',
  as: 'ticketDetails',
});

db.ticketcmds.hasMany(db.ticketcmds, {
  foreignKey: 'ticket_id',
});

// ############################################################
//  one-to-one relationship for ticketsStatusLogs-to-user
// ############################################################

db.ticketsStatusLogs.belongsTo(db.user, {
  foreignKey: 'changed_by',
  as: 'userDetails',
});

db.user.hasMany(db.ticketsStatusLogs, {
  foreignKey: 'changed_by',
});


// // ############################################################
// //  one-to-one relationship for user-to-role
// // ############################################################

// db.role.belongsTo(db.user, {
//   foreignKey: 'user_role',
//   as: 'userDetails',
// });

// db.user.hasMany(db.role, {
//   foreignKey: 'user_role',
// });


db.ROLES = ["user", "admin", "moderator"];

// -------------ends -----

module.exports = db;