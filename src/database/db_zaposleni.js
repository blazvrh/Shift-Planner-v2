const pool = require("./db_init").pool;


// ustvarimo novega zaposlenega
async function insert_newZaposleni (zaposleniData, usposobljenost) {
    let conn;
    let result = { isError: true, msg: "Nekaj je šlo narobe!"};
    try {
        conn = await pool.getConnection();


        let inserted = await conn.query("INSERT INTO zaposleni (poslovalnica, prikazanoImeZap, imeZap, priimekZap, " +
            "maxUrDanZap, maxUrTedenZap, maxNedelijZap, maxPraznikovZap, student, studentMlajsi, usposobljenostZap) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [zaposleniData.poslovalnica, zaposleniData.prikazanoImeZap, zaposleniData.imeZap, zaposleniData.priimekZap,
                zaposleniData.maxUrDanZap, zaposleniData.maxUrTedenZap, zaposleniData.maxNedelijZap, 
                zaposleniData.maxPraznikovZap, zaposleniData.student, zaposleniData.studentMlajsi, 
                "\"" + JSON.stringify(usposobljenost) + "\""]);
        
        if (inserted) {
            result = {isError: false, msg: "Success", zaposleniData: {
                
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


// get zaposlene
async function getZaposlene(poslovalnica) {
    let conn;

    let result = { isError: false, msg: "" };

    try {
        conn = await pool.getConnection();
        var db_zData = await conn.query("SELECT * FROM zaposleni WHERE poslovalnica='" + poslovalnica + "'");
        
        // če je vnešena vsaj ena poslovalica
        if (db_zData.length > 0) {
            vsiZaposleni = [];
            for (let i = 0; i < db_zData.length; i++) {
                
                vsiZaposleni.push(db_zData[i]);
            }
            result.isError = false;
            result.msg = "Success";
            result.vsiZaposleni = vsiZaposleni;
        }
        // če je ujemanje gesla in uporabniškega imena
        else {
            result = { isError: true, msg: "Ni vnosa za zaposlene!"};
        }
    } catch (err) {
        console.log(err.message);
        if (err.code = "ER_NO_SUCH_TABLE") {
            result = { isError: true, msg: "Ni najdenega vnosa!" };
        }
        else {
            result = { isError: true, msg: err.message };
        }
        throw err;
    } finally {
        if (conn) conn.end();
        return result;
    }
}


// izbrišemo zaposlenega
async function remove_Zaposlenega (zaposleniData) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka"};

    try {
        conn = await pool.getConnection();

        let deleted = await conn.query("DELETE FROM zaposleni WHERE poslovalnica = '" + zaposleniData.poslovalnica + 
            "' AND zapID = " + zaposleniData.zapID);
        
        if (deleted) {
            result = { isError: false, msg: "Success", zaposleniData: deleted };
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


// posodobimo zaposlenega
async function update_zaposleni (zaposleniData, usposobljenost) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka"};
    try {
        conn = await pool.getConnection();
        


        let updated = await conn.query("UPDATE zaposleni SET poslovalnica = ?, prikazanoImeZap = ?, imeZap = ?, " +
            "priimekZap = ?, maxUrDanZap = ?, maxUrTedenZap = ?, maxNedelijZap = ?, maxPraznikovZap = ? " +
            ", student = ?, studentMlajsi = ?, usposobljenostZap = ? WHERE zapID = ?", 
            [zaposleniData.poslovalnica, zaposleniData.prikazanoImeZap, zaposleniData.imeZap,
                zaposleniData.priimekZap, zaposleniData.maxUrDanZap, zaposleniData.maxUrTedenZap, 
                zaposleniData.maxNedelijZap, zaposleniData.maxPraznikovZap, zaposleniData.student, 
                zaposleniData.studentMlajsi, "\"" + JSON.stringify(usposobljenost) + "\"", zaposleniData.zapID]);
        
        if (updated) {
            result = {isError: false, msg: "Success", zaposleniData: {
                
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









module.exports.insert_newZaposleni = insert_newZaposleni;
module.exports.getZaposlene = getZaposlene;
module.exports.remove_Zaposlenega = remove_Zaposlenega;
module.exports.update_zaposleni = update_zaposleni;