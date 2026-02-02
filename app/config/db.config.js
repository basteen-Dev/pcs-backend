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
  HOST: "dpg-d5s6st4oud1c73930t20-a.oregon-postgres.render.com",
  USER: "root",
  PASSWORD: "PyF9jwWC8kZ5KmabpFtELTnVK5TJAiCU",
  DB: "pcs_z7av",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  port: 5432,
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