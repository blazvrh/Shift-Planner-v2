const pool = require("./db_init").pool;


// ustvarimo nov oddelek
async function insert_newOddelek (oddelekData) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka"};
    try {
        conn = await pool.getConnection();

        let inserted = await conn.query("INSERT INTO oddelki (poslovalnica, imeOddelka, smena, stVrsticOddelka, " +
            "prihod, odhod, specialOddelek) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [oddelekData.poslovalnica, oddelekData.imeOddelka, oddelekData.smena, oddelekData.stVrsticOddelka,
                oddelekData.prihod, oddelekData.odhod, oddelekData.specialOddelek]);
        
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


// get oddelke
async function getOddelek(poslovalnica) {
    let conn;

    let result = { isError: false, msg: "" };

    try {
        conn = await pool.getConnection();
        var db_oData = await conn.query("SELECT * FROM oddelki WHERE poslovalnica='" + poslovalnica + "'");
        
        // če je vnešena vsaj ena poslovalica
        if (db_oData.length > 0) {
            vsiOddelki = [];
            for (let i = 0; i < db_oData.length; i++) {
                
                vsiOddelki.push(db_oData[i]);
            }
            result.isError = false;
            result.msg = "Success";
            result.vsiOddelki = vsiOddelki;
        }
        // če je ujemanje gesla in uporabniškega imena
        else {
            result = { isError: true, msg: "Ni vnosa za oddelek!"};
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


// izbrišemo oddelek
async function remove_Oddelek (oddelekData) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka"};

    try {
        conn = await pool.getConnection();

        let deleted = await conn.query("DELETE FROM oddelki WHERE poslovalnica = '" + oddelekData.poslovalnica + 
            "' AND oddID = " + oddelekData.oddelekId);
        
        if (deleted) {
            result = { isError: false, msg: "Success", oddelekData: deleted };
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


// ustvarimo posodobimo oddelek
async function update_newOddelek (oddelekData) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka"};
    try {
        conn = await pool.getConnection();
        
        let inserted = await conn.query("UPDATE oddelki SET poslovalnica = ?, imeOddelka = ?, stVrsticOddelka = ?, " +
            "prihod = ?, odhod = ?, specialOddelek = ? WHERE oddID = ?", 
            [oddelekData.poslovalnica, oddelekData.imeOddelka, oddelekData.stVrsticOddelka,
                oddelekData.prihod, oddelekData.odhod, oddelekData.specialOddelek, oddelekData.oddID]);
        
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









module.exports.insert_newOddelek = insert_newOddelek;
module.exports.getOddelek = getOddelek;
module.exports.remove_Oddelek = remove_Oddelek;
module.exports.update_newOddelek = update_newOddelek;