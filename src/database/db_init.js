const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'remotemysql.com',
    port: "3306",     
    user:'lJJHApZs4s', 
    password: 'IO6Y2JTKLN',
    connectionLimit: 5,
    database: "lJJHApZs4s"
});







// // read - testirano
// async function readFromDb(tableName, properties, pogoj) {
//     if (!pogoj) pogoj = "";
//     else pogoj = " WHERE " + pogoj;
//     let conn;
//     let allRowsJson = {}
//     try {
//         conn = await pool.getConnection();
//         const rows = await conn.query("SELECT " + properties + " FROM " + tableName + pogoj);
//         for (var i = 0; i < rows.length; i++) {
//             var row = rows[i];
//             allRowsJson[i] = row;
//         }
//     } catch (err) {
//         throw err;
//     } finally {
//         if (conn) conn.end();

//         return allRowsJson;
//     }
// }

// // insert - netestirano
// function insertIntoDb (tableName, valuesArr) {
//     pool.getConnection().then((conn) => {
//         conn.query("INSERT INTO " + tableName + "(username, password, poslovalnica) VALUES (?, ?, ?)", 
//             valuesArr).then((rows) => {

//             // console.log(rows); //[ {val: 1}, meta: ... ]
//             conn.end();
//         }).catch(err => {
//             //handle error
//             console.log(err);
//             conn.end();
//     })
//     }).catch(err => {
//         //not connected
//         console.log(err);
//         console.log("not connected");
//     });
// }

// // delete  - netestirano
// function deleteFromDb (tableName, conditions) {
//     pool.getConnection().then((conn) => {
//         conn.query("DELETE FROM " + tableName + " WHERE " + conditions).then((rows) => {

//             console.log(rows); //[ {val: 1}, meta: ... ]
//             conn.end();
//         }).catch(err => {
//             //handle error
//             console.log(err);
//             conn.end();
//     })
//     }).catch(err => {
//         //not connected
//         console.log(err);
//         console.log("not connected");
//     });
// }

// module.exports.readFromDatabase = readFromDb;
// module.exports.insertIntoDatabase = insertIntoDb;
// module.exports.deleteFromDatabase = deleteFromDb;


module.exports.pool = pool;