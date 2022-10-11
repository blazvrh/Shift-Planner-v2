const express = require("express");

const db_zaposleni = require("../src/database/db_zaposleni");
const validate_zaposlen = require("../src/validation/validate_zaposlen");

const router = express.Router();

function parse_ReqData(reqData) {
  let newData = reqData;

  newData.maxUrDanZap =
    Number.parseInt(reqData.maxUrDanZap) > 0
      ? Number.parseInt(reqData.maxUrDanZap)
      : 0;
  newData.maxUrTedenZap =
    Number.parseInt(reqData.maxUrTedenZap) > 0
      ? Number.parseInt(reqData.maxUrTedenZap)
      : 0;
  newData.maxNedelijZap =
    Number.parseInt(reqData.maxNedelijZap) > 0
      ? Number.parseInt(reqData.maxNedelijZap)
      : 0;
  newData.maxPraznikovZap =
    Number.parseInt(reqData.maxPraznikovZap) > 0
      ? Number.parseInt(reqData.maxPraznikovZap)
      : 0;

  newData.student = reqData.student == "on" ? 1 : 0;
  newData.studentMlajsi = reqData.studentMlajsi == "on" ? 1 : 0;
  return newData;
}

// dodaj zaposlenega
router.post("/add", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const zaposlenInfo = parse_ReqData(req.body);
  let usposobljenost = JSON.parse(req.body.usposobljenost); // validate poje usposobljenost (dont know why)

  // validate data
  const validateErrors = validate_zaposlen.validate_zaposlenAdd(
    zaposlenInfo,
    false
  );
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

  // save to database
  let insertError = await db_zaposleni.insert_newZaposleni(
    zaposlenInfo,
    usposobljenost
  );

  res.send(insertError);
});

// get zaposlene
router.post("/get", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const zaposleniInfo = await db_zaposleni.getZaposlene(req.body.poslovalnica);

  res.send(zaposleniInfo);
});

router.post("/remove", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const zapInfo = await db_zaposleni.remove_Zaposlenega(req.body);

  res.send(zapInfo);
});

router.post("/update", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const zaposlenInfo = parse_ReqData(req.body);
  zaposlenInfo.zapID =
    Number.parseInt(zaposlenInfo.zapID) > 0
      ? Number.parseInt(zaposlenInfo.zapID)
      : 0;

  let usposobljenost = JSON.parse(req.body.usposobljenost);

  // validate data
  const validateErrors = validate_zaposlen.validate_zaposlenAdd(
    zaposlenInfo,
    true
  );
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

  // save to database
  let insertError = await db_zaposleni.update_zaposleni(
    zaposlenInfo,
    usposobljenost
  );

  res.send(insertError);
});

module.exports = router;
