const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'remotemysql.com',
    port: "3306",     
    user:'lJJHApZs4s', 
    password: 'IO6Y2JTKLN',
    connectionLimit: 5,
    database: "lJJHApZs4s"
});

module.exports.pool = pool;