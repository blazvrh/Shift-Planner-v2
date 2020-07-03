
// potrebne knjižnice
const express = require("express");
const router = express.Router();

// database
const db_index = require("../src/database/db_index");
const db_backup = require("../src/database/db_backup");
// validations
const validatie_predlog = require("../src/validation/validate_index");


// predlogi
router.post('/predlogi', async function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const predlogData = req.body;


    // validate data
    const validateErrors = validatie_predlog.validate_predlogAdd(predlogData);
    if (validateErrors.length > 0) {
        let errorMsg = "";
        validateErrors.forEach(element => {
            errorMsg += element.message + "\n";
        });
        let errRes = {
            isError: true,
            msg: errorMsg
        }
        res.send(errRes);
        return;
    }
    
    // save to database 
    let insertError = await db_index.insert_newPredlog(predlogData);

    // return completion
    res.send(insertError);
});


router.get('/backup', async function (req, res) {

    const backupMsg = await db_backup.backupAllData()

    res.send({"Backup query": backupMsg})
})

module.exports = router;