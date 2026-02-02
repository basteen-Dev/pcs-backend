// ############################################################################
//  local db config
// ############################################################################

// module.exports = {
//     HOST: "localhost",
//     USER: "postgres",
//     PASSWORD: "df123",
//     DB: "latestpronextjs",
//     dialect: "postgres",
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000
//     }
//   };

// ############################################################################
//  railway db config   postgresql://postgres:BJBoGIsvitALCJjReeCwMYxmwDocFtUj@metro.proxy.rlwy.net:39080/railway
// ############################################################################

module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  port: process.env.DB_PORT,
};


// ############################################################################
//  render db config
// ############################################################################

// module.exports = {
//   HOST: "dpg-d0m2fd0gjchc739fm9og-a.oregon-postgres.render.com",
//   USER: "pcsdb_user",
//   PASSWORD: "TEzLbWyYcVco7SAEZP3A3NxNX17QUXgt",
//   DB: "pcsdb",
//   dialect: "postgres",
//   // type: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// };