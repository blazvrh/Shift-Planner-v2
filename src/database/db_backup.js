const pool = require("./db_init").pool;
const poolBackup = require("./db_init").poolBackup;


// ustvarimo nov predlog
async function backupAllData() {
    // get number of days from last backup
    const dayDiff = await getDaysFromLastBackup();
    if (dayDiff === null) {
        return { status: "Failed to get the date" }
    }
    // no backup if there was already one less than 3 days ago
    if (dayDiff < 7) {
        return { isError: false, msg: "No backup needed. Last Backup " + dayDiff.toString() + " days ago." }
    } else {
        return await createBackup();
    }

}

async function createBackup() {
    let baseConn;
    let backupConn;
    let result = { isError: true, msg: "Neznana napaka" };

    try {
        baseConn = await pool.getConnection();
        backupConn = await poolBackup.getConnection();

        // USERS!
        let queryBase;
        let queryBackup;
        let insertQueryString = "";
        queryBase = await baseConn.query("SELECT * FROM `users`");
        queryBackup = await backupConn.query("SELECT * FROM `users`");

        let backupMaped = {};
        let baseMaped = {};
        queryBackup.forEach(element => {
            backupMaped[element.UID.toString()] = element
        });
        queryBase.forEach(element => {
            baseMaped[element.UID.toString()] = element
        });

        let baseKeys = Object.keys(baseMaped);
        baseKeys.forEach(key => {
            //  if there is no entry with this id, add it to be inserted as a new item
            if (typeof (backupMaped[key]) === "undefined") {
                insertQueryString += '(' + baseMaped[key].UID + ', "' + baseMaped[key].username + '", "' + baseMaped[key].password + '", "' +
                    baseMaped[key].poslovalnica + '", "' + baseMaped[key].previewPassword + '", "' + baseMaped[key].email + '", ' + baseMaped[key].verified + '), '
            } else {
                // On mismatch also add id to insert query
                const elementKeys = Object.keys(baseMaped[key])
                for (let i = 0; i < elementKeys.length; i++) {
                    if (elementKeys[i] !== "UID" && baseMaped[key][elementKeys[i]] !== backupMaped[key][elementKeys[i]]) {
                        insertQueryString += '(' + baseMaped[key].UID + ', "' + baseMaped[key].username + '", "' + baseMaped[key].password + '", "' +
                            baseMaped[key].poslovalnica + '", "' + baseMaped[key].previewPassword + '", "' + baseMaped[key].email + '", ' + baseMaped[key].verified + '), '
                        break;
                    }
                }
            }
        });

        if (insertQueryString.length > 0) {
            insertQueryString = insertQueryString.substring(0, insertQueryString.length - 2)
            let insertQuery = await backupConn.query("INSERT INTO `users` (UID, username, password, poslovalnica, previewPassword, " +
                "email, verified) VALUES " + insertQueryString + " ON DUPLICATE KEY UPDATE UID=VALUES(UID), username=VALUES(username), password=VALUES(password)," +
                " poslovalnica=VALUES(poslovalnica), previewPassword=VALUES(previewPassword), email=VALUES(email), verified=VALUES(verified)");
        }

        // ODDELKI!
        insertQueryString = "";
        queryBase = await baseConn.query("SELECT * FROM `oddelki`");
        queryBackup = await backupConn.query("SELECT * FROM `oddelki`");

        backupMaped = {};
        baseMaped = {};
        queryBackup.forEach(element => {
            backupMaped[element.oddID.toString()] = element
        });
        queryBase.forEach(element => {
            baseMaped[element.oddID.toString()] = element
        });

        baseKeys = Object.keys(baseMaped);
        baseKeys.forEach(key => {
            //  if there is no entry with this id, add it to be inserted as a new item
            if (typeof (backupMaped[key]) === "undefined") {
                insertQueryString += '(' + baseMaped[key].oddID + ', ' + baseMaped[key].positionForUser + ', "' + baseMaped[key].poslovalnica + '", "' +
                    baseMaped[key].imeOddelka + '", "' + baseMaped[key].smena + '", ' + baseMaped[key].stVrsticOddelka + ', "' + baseMaped[key].prihod +
                    '", "' + baseMaped[key].odhod + '", "' + baseMaped[key].specialOddelek + '"), '
            } else {
                // On mismatch also add id to insert query
                const elementKeys = Object.keys(baseMaped[key])
                for (let i = 0; i < elementKeys.length; i++) {
                    if (elementKeys[i] !== "oddID" && baseMaped[key][elementKeys[i]] !== backupMaped[key][elementKeys[i]]) {
                        insertQueryString += '(' + baseMaped[key].oddID + ', ' + baseMaped[key].positionForUser + ', "' + baseMaped[key].poslovalnica + '", "' +
                            baseMaped[key].imeOddelka + '", "' + baseMaped[key].smena + '", ' + baseMaped[key].stVrsticOddelka + ', "' + baseMaped[key].prihod +
                            '", "' + baseMaped[key].odhod + '", "' + baseMaped[key].specialOddelek + '"), '
                        break;
                    }
                }
            }
        });

        if (insertQueryString.length > 0) {
            insertQueryString = insertQueryString.substring(0, insertQueryString.length - 2)
            insertQuery = await backupConn.query("INSERT INTO `oddelki` (oddID, positionForUser, poslovalnica, imeOddelka, " +
                "smena, stVrsticOddelka, prihod, odhod, specialOddelek) VALUES " + insertQueryString + " ON DUPLICATE KEY UPDATE oddID=VALUES(oddID), positionForUser=VALUES(positionForUser)," +
                " poslovalnica=VALUES(poslovalnica), imeOddelka=VALUES(imeOddelka), smena=VALUES(smena), stVrsticOddelka=VALUES(stVrsticOddelka), prihod=VALUES(prihod), odhod=VALUES(odhod), specialOddelek=VALUES(specialOddelek)");
        }

        // // ZAPOSLENI!
        // insertQueryString = "";
        // queryBase = await baseConn.query("SELECT * FROM `zaposleni`");
        // queryBackup = await backupConn.query("SELECT * FROM `zaposleni`");

        // backupMaped = {};
        // baseMaped = {};
        // queryBackup.forEach(element => {
        //     backupMaped[element.zapID.toString()] = element
        // });
        // queryBase.forEach(element => {
        //     baseMaped[element.zapID.toString()] = element
        // });

        // baseKeys = Object.keys(baseMaped);
        // baseKeys.forEach(key => {
        //     //  if there is no entry with this id, add it to be inserted as a new item
        //     if (typeof (backupMaped[key]) === "undefined") {
        //         insertQueryString += '(' + baseMaped[key].zapID + ', "' + baseMaped[key].poslovalnica + '", "' + baseMaped[key].prikazanoImeZap + '", "' +
        //             baseMaped[key].imeZap + '", "' + baseMaped[key].priimekZap + '", ' + baseMaped[key].maxUrDanZap + ', ' + baseMaped[key].maxUrTedenZap + ', ' +
        //             baseMaped[key].maxNedelijZap + ', ' + baseMaped[key].maxPraznikovZap + ', ' + baseMaped[key].student + ', ' + baseMaped[key].studentMlajsi + 
        //             ', \'' + JSON.stringify(baseMaped[key].usposobljenostZap) + '\'), '
        //     } else {
        //         // On mismatch also add id to insert query
        //         const elementKeys = Object.keys(baseMaped[key])
        //         for (let i = 0; i < elementKeys.length; i++) {
        //             if (elementKeys[i] !== "oddID" && baseMaped[key][elementKeys[i]] !== backupMaped[key][elementKeys[i]]) {
        //                 insertQueryString += '(' + baseMaped[key].zapID + ', "' + baseMaped[key].poslovalnica + '", "' + baseMaped[key].prikazanoImeZap + '", "' +
        //                     baseMaped[key].imeZap + '", "' + baseMaped[key].priimekZap + '", ' + baseMaped[key].maxUrDanZap + ', ' + baseMaped[key].maxUrTedenZap + ', ' +
        //                     baseMaped[key].maxNedelijZap + ', ' + baseMaped[key].maxPraznikovZap + ', ' + baseMaped[key].student + ', ' + baseMaped[key].studentMlajsi + 
        //                     ', \'' + JSON.stringify(baseMaped[key].usposobljenostZap) + '\'), '
        //                 break;
        //             }
        //         }
        //     }
        // });

        // if (insertQueryString.length > 0) {
        //     insertQueryString = insertQueryString.substring(0, insertQueryString.length - 2)
        //     insertQuery = await backupConn.query("INSERT INTO `zaposleni` (zapID, poslovalnica, prikazanoImeZap, imeZap, " +
        //         "priimekZap, maxUrDanZap, maxUrTedenZap, maxNedelijZap, maxPraznikovZap, student, studentMlajsi, usposobljenostZap) VALUES " + insertQueryString + " ON DUPLICATE KEY UPDATE zapID=VALUES(zapID), poslovalnica=VALUES(poslovalnica)," +
        //         " prikazanoImeZap=VALUES(prikazanoImeZap), imeZap=VALUES(imeZap), priimekZap=VALUES(priimekZap), maxUrDanZap=VALUES(maxUrDanZap), maxUrTedenZap=VALUES(maxUrTedenZap), maxNedelijZap=VALUES(maxNedelijZap)," +
        //         " maxPraznikovZap=VALUES(maxPraznikovZap),  student=VALUES(student),  studentMlajsi=VALUES(studentMlajsi), usposobljenostZap=VALUES(usposobljenostZap)");
        // }

        // TEDENSKI PLAN!
        insertQueryString = "";
        queryBase = await baseConn.query("SELECT * FROM `tedenskiPlan`");
        queryBackup = await backupConn.query("SELECT * FROM `tedenskiPlan`");

        backupMaped = {};
        baseMaped = {};
        queryBackup.forEach(element => {
            backupMaped[element.weekID.toString()] = element
        });
        queryBase.forEach(element => {
            baseMaped[element.weekID.toString()] = element
        });

        baseKeys = Object.keys(baseMaped);
        baseKeys.forEach(key => {
            //  if there is no entry with this id, add it to be inserted as a new item
            if (typeof (backupMaped[key]) === "undefined" && baseMaped[key].year === 2020) {
                insertQueryString += '(' + baseMaped[key].weekID + ', "' + baseMaped[key].poslovalnica + '", ' + baseMaped[key].weekNumer + ', ' +
                    baseMaped[key].year + ', "' + baseMaped[key].mondayDate + '", \'' + baseMaped[key].weekData + '\', \'' + baseMaped[key].sundayData + '\', "' +
                    baseMaped[key].praznikiData + '", \'' + JSON.stringify(baseMaped[key].oddelkiDop) + '\', \'' + JSON.stringify(baseMaped[key].oddelkiPop) + '\'), '
            } else if (baseMaped[key].year === 2020) {
                // On mismatch also add id to insert query
                const elementKeys = Object.keys(baseMaped[key])
                for (let i = 0; i < elementKeys.length; i++) {
                    if (elementKeys[i] !== "oddID" && baseMaped[key][elementKeys[i]] !== backupMaped[key][elementKeys[i]]) {
                        insertQueryString += '(' + baseMaped[key].weekID + ', "' + baseMaped[key].poslovalnica + '", ' + baseMaped[key].weekNumer + ', ' +
                            baseMaped[key].year + ', "' + baseMaped[key].mondayDate + '", \'' + baseMaped[key].weekData + '\', \'' + baseMaped[key].sundayData + '\', "' +
                            baseMaped[key].praznikiData + '", \'' + JSON.stringify(baseMaped[key].oddelkiDop) + '\', \'' + JSON.stringify(baseMaped[key].oddelkiPop) + '\'), '
                        break;
                    }
                }
            }
        });

        if (insertQueryString.length > 0) {
            insertQueryString = insertQueryString.substring(0, insertQueryString.length - 2)
            insertQuery = await backupConn.query("INSERT INTO `tedenskiPlan` (weekID, poslovalnica, weekNumer, year, " +
                "mondayDate, weekData, sundayData, praznikiData, oddelkiDop, oddelkiPop) VALUES " + insertQueryString + " ON DUPLICATE KEY UPDATE weekID=VALUES(weekID), poslovalnica=VALUES(poslovalnica)," +
                " weekNumer=VALUES(weekNumer), year=VALUES(year), mondayDate=VALUES(mondayDate), weekData=VALUES(weekData), sundayData=VALUES(sundayData), praznikiData=VALUES(praznikiData)," +
                " oddelkiDop=VALUES(oddelkiDop),  oddelkiPop=VALUES(oddelkiPop)");
        }


        // insertQuery = await backupConn.query("INSERT INTO `backupDates` (BackupDate) VALUES ('" + (new Date()).toISOString() + "')");


        result = { isError: false, msg: "Backup successful." };

    } catch (err) {
        console.log(err.message);
        result = { isError: true, msg: err.message };
        throw err;
    } finally {
        if (baseConn) baseConn.end();
        if (backupConn) backupConn.end();

        return result;
    };
}

// get how many days ago was the last backup
async function getDaysFromLastBackup() {
    let backUpConn;

    try {

        backUpConn = await poolBackup.getConnection();

        const querry = await backUpConn.query("SELECT `backupDate` FROM `backupDates` WHERE ID = (SELECT MAX(`ID`) FROM `backupDates`)");
        const backupDate = new Date(querry[0].backupDate)

        // return difference from last backup in days as integer 
        return parseInt(Math.abs(new Date() - backupDate) / 1000 / 60 / 60 / 24);
    } catch (err) {
        console.log(err)
        return null;
    } finally {
        if (backUpConn) backUpConn.end()
    }
}


module.exports.backupAllData = backupAllData;