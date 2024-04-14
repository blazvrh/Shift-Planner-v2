const express = require("express");

const db_weekData = require("../src/database/db_urediPlan");
const validate_weekData = require("../src/validation/validate_urediPlan");

const router = express.Router();

router.post("/get", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  await db_weekData.save_temp(req);

  let weekData = await db_weekData.get_weeklyPlan(
    req.body.poslovalnica,
    req.body.weekNum,
    req.body.year
  );

  // pridobimo še nedeljo iz prejšnjega tedna
  if (req.body.getPrevSunday != null && weekData.weekData != null) {
    // zmanjšamo weekNum za 1
    let prevWeekNum = (Number.parseInt(req.body.weekNum) - 1).toString();

    // pridobimo iz data baze
    const prevWeekData = await db_weekData.get_weeklyPlan(
      req.body.poslovalnica,
      prevWeekNum,
      req.body.year
    );

    // pripnemo podatke prejšnjega tedna - nedeljo izluščimo na frontEndu
    weekData.prevWeekData = prevWeekData.weekData;
  }

  res.send(weekData);
});

// pridobimo nedelje v letu
router.post("/sundaysYear", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  let sundayData = await db_weekData.get_sundaysInYear(req.body);

  res.send(sundayData);
});

// pridobimo praznike v letu
router.post("/holidaysYear", async function (req, res) {
  if (!req.body) return res.sendStatus(400);


  let holidayData = await db_weekData.get_holidaysInYear(req.body);

  res.send(holidayData);
});

// shrani tedenski plan
router.post("/save", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  await db_weekData.save_temp(req);

  var weekInfo = req.body;
  weekInfo.weekNum = Number.parseInt(weekInfo.weekNum);
  weekInfo.year = Number.parseInt(weekInfo.year);

  var palnData = weekInfo.tableData;
  var oddelkiDop = weekInfo.oddelkiDop;
  var oddelkiPop = weekInfo.oddelkiPop;

  // validate data
  const validateErrors = validate_weekData.validate_weekData(weekInfo);
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
  let insertError = await db_weekData.save_weeklyPlan(
    weekInfo,
    palnData,
    oddelkiDop,
    oddelkiPop
  );

  res.send(insertError);
});

module.exports = router;
