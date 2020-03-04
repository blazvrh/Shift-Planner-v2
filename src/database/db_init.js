const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'remotemysql.com',
    port: "3306",     
    user:'lJJHApZs4s', 
    password: 'IO6Y2JTKLN',
    connectionLimit: 1,
    database: "lJJHApZs4s"
});

// comment the upper and uncomment below in case of server down time
// const pool = mariadb.createPool({
//     host: 'sql7.freesqldatabase.com',
//     port: "3306",     
//     user:'sql7325565', 
//     password: 'izhMz9nXtG',
//     connectionLimit: 1,
//     database: "sql7325565"
// });

const poolBackup = mariadb.createPool({
    host: 'sql7.freesqldatabase.com',
    port: "3306",     
    user:'sql7325565', 
    password: 'izhMz9nXtG',
    connectionLimit: 1,
    database: "sql7325565"
});

module.exports.pool = pool;
module.exports.poolBackup = poolBackup;