
// potrebne knjižnice
const express = require("express");
const router = express.Router();

// database
const db_register = require("../src/database/db_register");
const db_login = require("../src/database/db_login");
// validations
const validatie_user = require("../src/validation/validatie_user");



// register
router.post('/register', async function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const userData = req.body;

    // validate data
    const validateErrors = validatie_user.validate_userOnRegister(userData);
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
    
    // check for duplicate
    const duplicateErrors = await db_register.checkForDuplicate(userData);
    if (duplicateErrors.isError) {
        res.send(duplicateErrors);
        return;
    }
    
    // save to database 
    let insertError = await db_register.insert_newUser(userData);

    // return completion
    res.send(insertError);
});

// login 
router.post('/login', async function (req, res) { 
    if (!req.body) return res.sendStatus(400);

    const loginInfo = req.body;

    // validate data
    const validateErrors = validatie_user.validate_userOnLogin(loginInfo);
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

    // pogelj če uporabnik v bazi in je vpisano pravilno geslo
    const dataMatch = await db_login.checkForLoginInfo(loginInfo);
    
    res.send(dataMatch);
});


module.exports = router;