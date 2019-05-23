
// potrebne knjižnice
const express = require("express");
const router = express.Router();

// database
const db_weekData = require("../src/database/db_urediPlan");

// validations
const validate_weekData = require("../src/validation/validate_urediPlan");


// get teden data
router.post('/get', async function (req, res) { 
    if (!req.body) return res.sendStatus(400);
    
    const weekData = await db_weekData.get_weeklyPlan(req.body.poslovalnica, req.body.weekNum, req.body.year);

    res.send(weekData);
});


// shrani tedenski plan
router.post('/save', async function (req, res) { 
    if (!req.body) return res.sendStatus(400);

    var weekInfo = req.body;
    weekInfo.weekNum = Number.parseInt(weekInfo.weekNum);
    weekInfo.year = Number.parseInt(weekInfo.year);

    var palnData = weekInfo.tableData;
    var oddelkiDop = weekInfo.oddelkiDop;
    var oddelkiPop = weekInfo.oddelkiPop;
    // var oddelkiDop = JSON.parse(weekInfo.oddelkiDop);
    // var oddelkiPop = JSON.parse(weekInfo.oddelkiPop);

    // validate data
    const validateErrors = validate_weekData.validate_weekData(weekInfo);
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
    let insertError = await db_weekData.save_weeklyPlan(weekInfo, palnData, oddelkiDop, oddelkiPop);

    res.send(insertError);
});


module.exports = router;