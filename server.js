// potrebne knjižnice
const express = require("express");
const path = require("path");
const formData = require("express-form-data");

// database
const db_register = require("./src/database/db_register");
const db_login = require("./src/database/db_login");


// validations
const validatie = require("./src/validation/validatie");


// vspostavi server
let app = express();
// določi pot za public mapo z html, css itd...
app.use(express.static(path.join(__dirname, 'public')));

// potrebno za parsanje POST requestov
const os = require("os");
const options = {
    uploadDir: os.tmpdir(),
    autoClean: true
};

// parse data with connect-multiparty. 
app.use(formData.parse(options));
// clear from the request and delete all empty files (size == 0)
app.use(formData.format());
// change file objects to stream.Readable 
app.use(formData.stream());
// union body and files
app.use(formData.union());



// REGISTER
app.post('/register', async function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const userData = req.body;
    
    // res.setHeader('Content-Type', 'application/json');

    // validate data
    const validateErrors = validatie.validate_userOnRegister(userData);
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

// LOGIN 
app.post('/login', async function (req, res) { 
    if (!req.body) return res.sendStatus(400);

    const loginInfo = req.body;

    // validate data
    const validateErrors = validatie.validate_userOnLogin(loginInfo);
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




// odpre server na portu 3000
let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("lisening on port: " + port); 
});