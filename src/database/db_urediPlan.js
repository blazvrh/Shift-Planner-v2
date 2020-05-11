
const pool = require("./db_init").pool;


// pridobi tedenski plan
async function get_weeklyPlan(poslovalnica, weekNum, year) {
    let conn;

    let result = { isError: false, msg: "" };

    try {
        conn = await pool.getConnection();
        var db_wData = await conn.query("SELECT * FROM tedenskiPlan WHERE poslovalnica='" + poslovalnica +
            "' AND weekNumer=" + weekNum + " AND year=" + year);

        // če je vnešena vsaj ena poslovalica
        if (db_wData.length > 0) {
            result.isError = false;
            result.msg = "Success";
            result.weekData = db_wData[0];
        }
        else {
            result = { isError: true, msg: "Ni vnosa za ta teden!" };
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


// pridobi nedelje v letu
async function get_sundaysInYear(userData) {
    let conn;

    let result = { isError: false, msg: "" };

    try {
        conn = await pool.getConnection();

        var db_sundayData = await conn.query("SELECT sundayData FROM tedenskiPlan WHERE poslovalnica='" + userData.poslovalnica +
            "' AND year=" + userData.sundayYear);

        result.allSundays = [];
        for (let i = 0; i < db_sundayData.length; i++) {
            if (db_sundayData[i].sundayData && db_sundayData[i].sundayData !== "") {
                result.allSundays.push(db_sundayData[i].sundayData);
            }
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


// pridobi praznike v letu
async function get_holidaysInYear(userData) {
    let conn;

    let result = { isError: false, msg: "" };

    try {
        conn = await pool.getConnection();

        var db_holidayData = await conn.query("SELECT praznikiData FROM tedenskiPlan WHERE poslovalnica='" + userData.poslovalnica +
            "' AND year=" + userData.year);

        result.allHolidays = [];
        for (let i = 0; i < db_holidayData.length; i++) {
            if (db_holidayData[i].praznikiData && db_holidayData[i].praznikiData !== "") {
                result.allHolidays.push(db_holidayData[i].praznikiData);
            }
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


// shranimo tedenski plan
async function save_weeklyPlan(weekInfo, planData, oddelkiDop, oddelkiPop) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka" };

    let existingData = await get_weeklyPlan(weekInfo.poslovalnica, weekInfo.weekNum, weekInfo.year);
    let dataExists = existingData.weekData != null; // če je to prvi vnos za teden + leto + poslovalnica

    try {
        conn = await pool.getConnection();

        // če vnos že obstaja
        if (dataExists) {
            let inserted = await conn.query("UPDATE tedenskiPlan SET weekData = ?, oddelkiDop = ?, oddelkiPop = ?, " +
                "sundayData = ?, praznikiData = ? WHERE poslovalnica ='" +
                weekInfo.poslovalnica + "' AND weekNumer =" + weekInfo.weekNum + " AND year =" + weekInfo.year,
                [planData, oddelkiDop, oddelkiPop, weekInfo.sundayData, weekInfo.praznikiData]);

            if (inserted) {
                result = { isError: false, msg: "Success", inserted: inserted };
            }
        }
        // če je to prvi vnos
        else {
            let inserted = await conn.query("INSERT INTO tedenskiPlan (poslovalnica, weekNumer, year, " +
                "mondayDate, weekData, oddelkiDop, oddelkiPop, sundayData, praznikiData) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [weekInfo.poslovalnica, weekInfo.weekNum, weekInfo.year, weekInfo.mondayDate, planData, oddelkiDop,
                    oddelkiPop, weekInfo.sundayData, weekInfo.praznikiData]);

            if (inserted) {
                result = { isError: false, msg: "Success" };
            }
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


// shranimo tedenski plan
async function save_temp(data) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka" };

    try {
        conn = await pool.getConnection();

        let inserted = await conn.query("INSERT INTO temp (data) VALUES (?)", [data])

        if (inserted) {
            result = { isError: false, msg: "Success", inserted: inserted };
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





module.exports.get_sundaysInYear = get_sundaysInYear;
module.exports.get_holidaysInYear = get_holidaysInYear;
module.exports.get_weeklyPlan = get_weeklyPlan;
module.exports.save_weeklyPlan = save_weeklyPlan;
module.exports.save_temp = save_temp;