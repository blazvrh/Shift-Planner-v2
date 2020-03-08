const mariadb = require('mariadb');

// const remoteMySqlDB = mariadb.createPool({
//     host: 'remotemysql.com',
//     port: "3306",     
//     user:'lJJHApZs4s', 
//     password: 'IO6Y2JTKLN',
//     connectionLimit: 3,
//     database: "lJJHApZs4s"
// });

// // // comment the upper and uncomment below in case of server down time
// const freesqlDB = mariadb.createPool({
//     host: 'sql7.freesqldatabase.com',
//     port: "3306",     
//     user:'sql7325565', 
//     password: 'izhMz9nXtG',
//     connectionLimit: 8,
//     database: "sql7325565"
// });


// // heroku server
// const herokuDB = mariadb.createPool({
//     host: 'eu-cdbr-west-02.cleardb.net',
//     port: "3306",     
//     user:'b8c470cfefe909', 
//     password: '23a0cb2b',
//     connectionLimit: 3,
//     database: "heroku_92a83711811d21f"
// });


// // const pool = herokuDB
// // const poolBackup = remoteMySqlDB
// const pool = remoteMySqlDB
// const poolBackup = null

const poolBackup = mariadb.createPool({
    host: 'remotemysql.com',
    port: "3306",     
    user:'lJJHApZs4s', 
    password: 'IO6Y2JTKLN',
    connectionLimit: 1,
    database: "lJJHApZs4s"
});


const pool = mariadb.createPool({
    host: 'eu-cdbr-west-02.cleardb.net',
    port: "3306",     
    user:'b8c470cfefe909', 
    password: '23a0cb2b',
    connectionLimit: 5,
    database: "heroku_92a83711811d21f"
});
    


module.exports.pool = pool;
module.exports.poolBackup = poolBackup;