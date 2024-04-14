const express = require("express");

const db_register = require("../src/database/db_register");
const db_login = require("../src/database/db_login");
const validatie_user = require("../src/validation/validatie_user");

const router = express.Router();

router.post("/register", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const userData = req.body;

  const validateErrors = validatie_user.validate_userOnRegister(userData);
  if (validateErrors.length > 0) {
    let errorMsg = "";
    validateErrors.forEach((element) => {
      errorMsg += element.message + "\n";
    });
    let errRes = {
      isError: true,
      msg: errorMsg,
    };
    res.send(errRes);
    return;
  }

  const duplicateCheck = await db_register.checkForDuplicate(userData);
  if (duplicateCheck.isError) {
    res.send(duplicateCheck);
    return;
  }

  const insertResponse = await db_register.insertNewUser(userData);
  res.send(insertResponse);
});

router.post("/login", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const loginInfo = req.body;

  const validateErrors = validatie_user.validate_userOnLogin(loginInfo);
  if (validateErrors.length > 0) {
    let errorMsg = "";
    validateErrors.forEach((element) => {
      errorMsg += element.message + "\n";
    });
    let errRes = {
      isError: true,
      msg: errorMsg,
    };
    res.send(errRes);
    return;
  }

  const dataMatch = await db_login.checkForLoginInfo(loginInfo);

  res.cookie("user", loginInfo.username)  // For saving to temp table

  res.send(dataMatch);
});

router.post("/login/guest", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const loginInfo = req.body;

  const validateErrors = validatie_user.validate_userOnLogin_guest(loginInfo);
  if (validateErrors.length > 0) {
    let errorMsg = "";
    validateErrors.forEach((element) => {
      errorMsg += element.message + "\n";
    });
    let errRes = {
      isError: true,
      msg: errorMsg,
    };
    res.send(errRes);
    return;
  }

  const dataMatch = await db_login.checkForLoginInfo_guest(loginInfo);
  res.send(dataMatch);
});

module.exports = router;
