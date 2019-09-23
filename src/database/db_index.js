const pool = require("./db_init").pool;


// ustvarimo nov predlog
async function insert_newPredlog (predlogData) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka"};
    try {
        conn = await pool.getConnection();

        let inserted = await conn.query("INSERT INTO predlogi (predlogText) VALUES (?)", 
            [predlogData.predlogTxt]);
        
        if (inserted) {
            result = {isError: false, msg: "Success", oddelekData: {
                
            }};
        }
    } catch (err) {
        console.log(err.message);
        result = { isError: true, msg: err.message };
        throw err;
    } finally {
        if (conn) conn.end();
        
        return result;
    };
}



module.exports.insert_newPredlog = insert_newPredlog;