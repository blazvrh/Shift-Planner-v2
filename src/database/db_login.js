const pool = require("./db_init").pool;


// preveri login
async function checkForLoginInfo(inputUserData) {
    let conn;

    let loginErrors = { isError: false, msg: "" };

    try {
        conn = await pool.getConnection();
        var db_uData = await conn.query("SELECT username, password, verified, poslovalnica FROM users WHERE username='" + inputUserData.username + "'");
        
        // če uporabnik ne obstaja
        if (db_uData.length < 1) {
            loginErrors = { isError: true, msg: "Ta uporabnik ne obstaja!"};
        }
        // če je ujemanje gesla in uporabniškega imena
        else if (db_uData[0].password == inputUserData.password) {
            // je verificiran
            if (db_uData[0].verified > 0) {
                loginErrors = { 
                    isError: false,
                    msg: "Success",
                    userData: {
                        username: db_uData[0].username,
                        poslovalnica: db_uData[0].poslovalnica
                    }
                };
            }
            // ni verificiran
            else {
                loginErrors = { isError: true, msg: "Uporabniški račun ni potrjen. Obrnite se na administratorja!" };
            }
        // geslo in uporabniško ime se ne ujemata
        } else {
            loginErrors = { isError: true, msg: "Nepravilno uporabniško ime ali geslo!" };
        }

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
        return loginErrors;
    }
}

// preveri login za gosta
async function checkForLoginInfo_guest(inputUserData) {
    let conn;

    let loginErrors = { isError: false, msg: "" };

    try {
        conn = await pool.getConnection();
        var db_uData = await conn.query("SELECT poslovalnica, previewPassword FROM users WHERE poslovalnica='" + inputUserData.poslovalnica + "'");
        
        // če uporabnik ne obstaja
        if (db_uData.length < 1) {
            loginErrors = { isError: true, msg: "Ta poslovalnica ne obstaja!"};
        }
        // če je ujemanje gesla in uporabniškega imena
        else if (db_uData[0].previewPassword == inputUserData.passwordGuest) {
            loginErrors = { 
                isError: false,
                msg: "Success",
                poslovalnica: {
                    poslovalnica: db_uData[0].poslovalnica
                }
            };
        // geslo in uporabniško ime se ne ujemata
        } else {
            loginErrors = { isError: true, msg: "Nepravilna poslovalnica ali geslo!" };
        }

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
        return loginErrors;
    }
}

module.exports.checkForLoginInfo = checkForLoginInfo;
module.exports.checkForLoginInfo_guest = checkForLoginInfo_guest;