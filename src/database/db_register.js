const bcrypt = require('bcryptjs');
const pool = require("./db_init").pool;


// preveri za duplikat
async function checkForDuplicate(userData) {
    let conn;

    let duplicateErrors = { isError: false, msg: "" };

    try {
        conn = await pool.getConnection();
        const db_username = await conn.query("SELECT username FROM users WHERE username='" + userData.username + "'");
        const db_poslovalnica = await conn.query("SELECT username FROM users WHERE poslovalnica='" + userData.poslovalnica + "'");
        
        // preverimo če smo našli match iz ustvarimo error če smo
        if (db_username.length > 0) {
            duplicateErrors.isError = true;
            duplicateErrors.msg += "Uporabniško ime že obstaja. Prosim izberite drugo uporabniško ime!\n";
        }
        if (db_poslovalnica.length > 0) {
            duplicateErrors.isError = true;
            duplicateErrors.msg += "Poslovalnica že obstaja. Prosim izberite drugo ime poslovalnice!\n";
        }
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.end();
        return duplicateErrors;
    }
}

// ustvarimo novega uprorabnika
async function insert_newUser (userData) {
    let conn;
    let result = { isError: true, msg: "Neznana napaka"};
    try {
        conn = await pool.getConnection();

        // zaheširamo passworde
        const passwordUserHashed = bcrypt.hashSync(userData.password, 10);
        const passwordPreviewHashed = bcrypt.hashSync(userData.previewPassword, 10);

        let inserted = await conn.query("INSERT INTO users (username, password, poslovalnica, previewPassword, " +
            "email, verified) VALUES (?, ?, ?, ?, ?, ?)", 
            [userData.username, passwordUserHashed, userData.poslovalnica, passwordPreviewHashed,
                userData.email, 1]);
        
        if (inserted) {
            result = {isError: false, msg: "Success", userData: {
                username: userData.username,
                poslovalnica: userData.poslovalnica
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


module.exports.checkForDuplicate = checkForDuplicate;
module.exports.insert_newUser = insert_newUser;