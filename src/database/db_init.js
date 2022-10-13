// const mariadb = require("mariadb");
const mysql = require("mysql2");
if (process.env.IS_CYCLIC != "true") {
  require("dotenv").config();
}

// const pool = mariadb.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   database: process.env.DB_NAME,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   connectionLimit: 5,
//   allowPublicKeyRetrieval: true,
// });

function getConnection() {
  const connection = mysql.createConnection(process.env.DATABASE_URL);
  return connection;
}

function executeQuery(query) {
  const connection = getConnection();

  return new Promise(function (resolve, reject) {
    const res = connection.query(query, function (err, results, fields) {
      if (err) {
        connection.end();
        reject(err);
      } else {
        connection.end();
        resolve(results);
      }
    });
  });
}

function formatQuery(sqlStatement, values) {
  return mysql.format(sqlStatement, values);
}

// module.exports.pool = pool;
module.exports.executeQuery = executeQuery;
module.exports.formatQuery = formatQuery;
