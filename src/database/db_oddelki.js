const pool = require("./db_init").pool;


// ustvarimo nov oddelek
async function insert_newOddelek (oddelekData) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka"};
    try {
        conn = await pool.getConnection();

        let inserted = await conn.query("INSERT INTO oddelki (positionForUser, poslovalnica, imeOddelka, smena, stVrsticOddelka, " +
            "prihod, odhod, specialOddelek) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
            [oddelekData.positionForUser, oddelekData.poslovalnica, oddelekData.imeOddelka, oddelekData.smena, oddelekData.stVrsticOddelka,
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
        if (err.code === "ER_NO_SUCH_TABLE") {
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

        // porpavimo idexe da ni luknje
        const smenaQuery = await conn.query("SELECT smena FROM oddelki WHERE oddID='" + oddelekData.oddelekId + "'");
        const prevPositionQurey = await conn.query("SELECT positionForUser FROM oddelki WHERE oddID='" + oddelekData.oddelekId + "'");

        const smena = smenaQuery[0].smena;
        const prevPosition = prevPositionQurey[0].positionForUser;
        
        let correctedIndexes = await conn.query("UPDATE oddelki SET positionForUser = positionForUser - 1 WHERE smena = '" + 
            smena + "' AND positionForUser > " + prevPosition + " AND poslovalnica = '" + oddelekData.poslovalnica + "'");
   

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
async function update_newOddelek (oddelekData, maxIndexes) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka"};
    
    try {
        conn = await pool.getConnection();
        
        const smenaQuery = await conn.query("SELECT smena FROM oddelki WHERE oddID='" + oddelekData.oddID + "'");
        const prevPositionQurey = await conn.query("SELECT positionForUser FROM oddelki WHERE oddID='" + oddelekData.oddID + "'");

        const smena = smenaQuery[0].smena;
        const prevPosition = prevPositionQurey[0].positionForUser;
        
        // da ne bo luknje
        if (oddelekData.positionForUser > maxIndexes["maxIndex_" + smena]) {
            oddelekData.positionForUser = maxIndexes["maxIndex_" + smena];
        }

        // porpavimo idex za vse vmesne
        if (prevPosition > oddelekData.positionForUser) {
            let correctedIndexes = await conn.query("UPDATE oddelki SET positionForUser = positionForUser + 1 WHERE poslovalnica = '" +
                oddelekData.poslovalnica + "' AND smena = '" + 
                smena + "' AND positionForUser < " + prevPosition + " AND positionForUser >= " + oddelekData.positionForUser);
        } else if (prevPosition < oddelekData.positionForUser) {
            let correctedIndexes = await conn.query("UPDATE oddelki SET positionForUser = positionForUser - 1 WHERE poslovalnica = '" +
                oddelekData.poslovalnica + "' AND smena = '" + 
                smena + "' AND positionForUser > " + prevPosition + " AND positionForUser <= " + oddelekData.positionForUser);
        }

        let inserted = await conn.query("UPDATE oddelki SET positionForUser = ?, poslovalnica = ?, imeOddelka = ?, stVrsticOddelka = ?, " +
            "prihod = ?, odhod = ?, specialOddelek = ? WHERE oddID = ? AND poslovalnica = ?", 
            [oddelekData.positionForUser, oddelekData.poslovalnica, oddelekData.imeOddelka, oddelekData.stVrsticOddelka,
            oddelekData.prihod, oddelekData.odhod, oddelekData.specialOddelek, oddelekData.oddID, oddelekData.poslovalnica]);
    
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