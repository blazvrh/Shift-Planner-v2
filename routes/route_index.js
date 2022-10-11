const express = require("express");

const db_index = require("../src/database/db_index");
const validator = require("../src/validation/validate_index");

const router = express.Router();

router.post("/predlogi", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const bodyData = req.body;
  const validationErrors = validator.validate_predlogAdd(bodyData);

  if (validationErrors.length > 0) {
    const errorResponse = getErrorResponse(validationErrors);
    res.send(errorResponse);
    return;
  }

  let insertError = await db_index.insert_newPredlog(bodyData);

  res.send(insertError);
});

function getErrorResponse(validationErrors) {
  let errorMsg = "";
  validationErrors.forEach((element) => {
    errorMsg += element.message + "\n";
  });

  return {
    isError: true,
    msg: errorMsg,
  };
}

module.exports = router;
