const express = require("express");

const db_oddelki = require("../src/database/db_oddelki");
const validate_oddelek = require("../src/validation/validate_oddelek");

const router = express.Router();

router.post("/add", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  var oddelekInfo = req.body;
  oddelekInfo.stVrsticOddelka = Number.parseInt(oddelekInfo.stVrsticOddelka);
  oddelekInfo.positionForUser = Number.parseInt(oddelekInfo.positionForUser);

  const validateErrors = validate_oddelek.validate_oddelekAdd(oddelekInfo);
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

  let insertError = await db_oddelki.insert_newOddelek(oddelekInfo);

  res.send(insertError);
});

router.post("/get", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const oddelkiInfo = await db_oddelki.getOddelek(req.body.poslovalnica);

  res.send(oddelkiInfo);
});

router.post("/remove", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const oddelekInfo = await db_oddelki.remove_Oddelek(req.body);

  res.send(oddelekInfo);
});

router.post("/update", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  var oddelekInfo = req.body;

  oddelekInfo.stVrsticOddelka = Number.parseInt(oddelekInfo.stVrsticOddelka);
  oddelekInfo.oddID = Number.parseInt(oddelekInfo.oddID);
  oddelekInfo.positionForUser = Number.parseInt(oddelekInfo.positionForUser);

  const maxIndexes = JSON.parse(oddelekInfo.maxIndexes);

  const validateErrors = validate_oddelek.validate_oddelekUpdate(oddelekInfo);

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

  let insertError = await db_oddelki.update_newOddelek(oddelekInfo, maxIndexes);
  res.send(insertError);
});

module.exports = router;
