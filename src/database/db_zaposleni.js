const executeQuery = require("./db_init").executeQuery;
const formatQuery = require("./db_init").formatQuery;

async function insert_newZaposleni(zaposleniData, usposobljenost) {
  const query = formatQuery(
    "INSERT INTO zaposleni (poslovalnica, prikazanoImeZap, imeZap, priimekZap, " +
      "maxUrDanZap, maxUrTedenZap, maxNedelijZap, maxPraznikovZap, student, studentMlajsi, usposobljenostZap) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      zaposleniData.poslovalnica,
      zaposleniData.prikazanoImeZap,
      zaposleniData.imeZap,
      zaposleniData.priimekZap,
      zaposleniData.maxUrDanZap,
      zaposleniData.maxUrTedenZap,
      zaposleniData.maxNedelijZap,
      zaposleniData.maxPraznikovZap,
      zaposleniData.student,
      zaposleniData.studentMlajsi,
      '"' + JSON.stringify(usposobljenost) + '"',
    ]
  );

  return executeQuery(query)
    .then((res) => {
      if (res.affectedRows == 0) {
        return { isError: true, msg: "Nepričakovana napaka" };
      }

      return { isError: false, msg: "Success", zaposleniData: {} };
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

async function getZaposlene(poslovalnica) {
  const query =
    "SELECT * FROM zaposleni WHERE poslovalnica='" + poslovalnica + "'";

  return executeQuery(query)
    .then((res) => {
      if (res.length == 0) {
        return { isError: true, msg: "Ni vnosa za zaposlene!" };
      }

      const vsiZaposleni = [];
      for (let i = 0; i < res.length; i++) {
        vsiZaposleni.push(res[i]);
      }
      return {
        isError: false,
        msg: "Success",
        vsiZaposleni: vsiZaposleni,
      };
    })
    .catch((err) => {
      console.log(err);
      if ((err.code = "ER_NO_SUCH_TABLE")) {
        return { isError: true, msg: "Ni najdenega vnosa!" };
      } else {
        return { isError: true, msg: err.message };
      }
    });
}

async function remove_Zaposlenega(zaposleniData) {
  const query =
    "DELETE FROM zaposleni WHERE poslovalnica = '" +
    zaposleniData.poslovalnica +
    "' AND zapID = " +
    zaposleniData.zapID;

  return executeQuery(query)
    .then((res) => {
      if (res.affectedRows == 0) {
        console.log(res);
        return { isError: true, msg: "Nepričakovana napaka" };
      }

      return { isError: false, msg: "Success", zaposleniData: res };
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

// posodobimo zaposlenega
async function update_zaposleni(zaposleniData, usposobljenost) {
  const query = formatQuery(
    "UPDATE zaposleni SET poslovalnica = ?, prikazanoImeZap = ?, imeZap = ?, " +
      "priimekZap = ?, maxUrDanZap = ?, maxUrTedenZap = ?, maxNedelijZap = ?, maxPraznikovZap = ? " +
      ", student = ?, studentMlajsi = ?, usposobljenostZap = ? WHERE zapID = ?",
    [
      zaposleniData.poslovalnica,
      zaposleniData.prikazanoImeZap,
      zaposleniData.imeZap,
      zaposleniData.priimekZap,
      zaposleniData.maxUrDanZap,
      zaposleniData.maxUrTedenZap,
      zaposleniData.maxNedelijZap,
      zaposleniData.maxPraznikovZap,
      zaposleniData.student,
      zaposleniData.studentMlajsi,
      '"' + JSON.stringify(usposobljenost) + '"',
      zaposleniData.zapID,
    ]
  );

  return executeQuery(query)
    .then((res) => {
      if (res.affectedRows == 0) {
        console.log(res);
        return { isError: true, msg: "Nepričakovana napaka" };
      }

      return { isError: false, msg: "Success", zaposleniData: {} };
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

module.exports.insert_newZaposleni = insert_newZaposleni;
module.exports.getZaposlene = getZaposlene;
module.exports.remove_Zaposlenega = remove_Zaposlenega;
module.exports.update_zaposleni = update_zaposleni;
