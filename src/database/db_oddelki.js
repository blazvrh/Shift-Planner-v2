const executeQuery = require("./db_init").executeQuery;
const formatQuery = require("./db_init").formatQuery;

async function insert_newOddelek(oddelekData) {
  const query = formatQuery(
    "INSERT INTO oddelki (positionForUser, poslovalnica, imeOddelka, smena, stVrsticOddelka, " +
      "prihod, odhod, specialOddelek) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      oddelekData.positionForUser,
      oddelekData.poslovalnica,
      oddelekData.imeOddelka,
      oddelekData.smena,
      oddelekData.stVrsticOddelka,
      oddelekData.prihod,
      oddelekData.odhod,
      oddelekData.specialOddelek,
    ]
  );

  return executeQuery(query)
    .then((res) => {
      if (res.affectedRows == 0) {
        return { isError: true, msg: "Nepričakovana napaka" };
      }

      return { isError: false, msg: "Success", oddelekData: {} };
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

async function getOddelek(poslovalnica) {
  const query =
    "SELECT * FROM oddelki WHERE poslovalnica='" + poslovalnica + "'";

  return executeQuery(query)
    .then((res) => {
      if (res.length == 0) {
        return { isError: true, msg: "Ni vnosa za oddelek!" };
      }

      const vsiOddelki = [];
      for (let i = 0; i < res.length; i++) {
        vsiOddelki.push(res[i]);
      }
      return {
        isError: false,
        msg: "Success",
        vsiOddelki: vsiOddelki,
      };
    })
    .catch((err) => {
      console.log(err);
      if (err.code === "ER_NO_SUCH_TABLE") {
        return { isError: true, msg: "Ni najdenega vnosa!" };
      } else {
        return { isError: true, msg: "Nepričakovana napaka" };
      }
    });
}

async function remove_Oddelek(oddelekData) {
  const shift = await getDepartmentShift(oddelekData.oddelekId);
  const position = await getDepartmentPostion(oddelekData.oddelekId);

  if (!position || !shift) {
    return { isError: true, msg: "Neznana napaka" };
  }

  const queryUpdateIndexes =
    "UPDATE oddelki SET positionForUser = positionForUser - 1 WHERE smena = '" +
    shift +
    "' AND positionForUser > " +
    position +
    " AND poslovalnica = '" +
    oddelekData.poslovalnica +
    "'";

  const updateIndexesSuccess = await executeQuery(queryUpdateIndexes)
    .then((res) => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

  if (!updateIndexesSuccess) {
    return { isError: true, msg: "Neznana napaka" };
  }

  const queryDelete =
    "DELETE FROM oddelki WHERE poslovalnica = '" +
    oddelekData.poslovalnica +
    "' AND oddID = " +
    oddelekData.oddelekId;

  return executeQuery(queryDelete)
    .then((res) => {
      if (res.affectedRows == 0) {
        console.log(res);
        return { isError: true, msg: "Nepričakovana napaka" };
      }
      return { isError: false, msg: "Success", oddelekData: res };
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

async function update_newOddelek(oddelekData, maxIndexes) {
  const shift = await getDepartmentShift(oddelekData.oddID);
  const position = await getDepartmentPostion(oddelekData.oddID);

  if (!position || !shift) {
    return { isError: true, msg: "Neznana napaka" };
  }

  if (oddelekData.positionForUser > maxIndexes["maxIndex_" + shift]) {
    oddelekData.positionForUser = maxIndexes["maxIndex_" + shift];
  }

  let queryUpdateIndexes = null;
  if (position > oddelekData.positionForUser) {
    queryUpdateIndexes =
      "UPDATE oddelki SET positionForUser = positionForUser + 1 WHERE poslovalnica = '" +
      oddelekData.poslovalnica +
      "' AND smena = '" +
      shift +
      "' AND positionForUser < " +
      position +
      " AND positionForUser >= " +
      oddelekData.positionForUser;
  } else if (position < oddelekData.positionForUser) {
    queryUpdateIndexes =
      "UPDATE oddelki SET positionForUser = positionForUser - 1 WHERE poslovalnica = '" +
      oddelekData.poslovalnica +
      "' AND smena = '" +
      shift +
      "' AND positionForUser > " +
      position +
      " AND positionForUser <= " +
      oddelekData.positionForUser;
  }

  if (queryUpdateIndexes) {
    const queryUpdateIndexesSuccess = await executeQuery(queryUpdateIndexes)
      .then((res) => {
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });

    if (!queryUpdateIndexesSuccess) {
      return { isError: true, msg: "Neznana napaka" };
    }
  }

  const queryUpdateRow = formatQuery(
    "UPDATE oddelki SET positionForUser = ?, poslovalnica = ?, imeOddelka = ?, stVrsticOddelka = ?, " +
      "prihod = ?, odhod = ?, specialOddelek = ? WHERE oddID = ? AND poslovalnica = ?",
    [
      oddelekData.positionForUser,
      oddelekData.poslovalnica,
      oddelekData.imeOddelka,
      oddelekData.stVrsticOddelka,
      oddelekData.prihod,
      oddelekData.odhod,
      oddelekData.specialOddelek,
      oddelekData.oddID,
      oddelekData.poslovalnica,
    ]
  );

  return executeQuery(queryUpdateRow)
    .then((res) => {
      if (res.affectedRows == 0) {
        console.log(res);
        return { isError: true, msg: "Nepričakovana napaka" };
      }

      return { isError: false, msg: "Success", oddelekData: {} };
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

async function getDepartmentShift(departmentId) {
  const queryShift =
    "SELECT smena FROM oddelki WHERE oddID='" + departmentId + "'";

  return await executeQuery(queryShift)
    .then((res) => {
      if (res.length == 0) {
        return null;
      }
      return res[0].smena;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
}

async function getDepartmentPostion(departmentId) {
  const queryPosition =
    "SELECT positionForUser FROM oddelki WHERE oddID='" + departmentId + "'";

  return await executeQuery(queryPosition)
    .then((res) => {
      if (res.length == 0) {
        return null;
      }
      return res[0].positionForUser;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
}

module.exports.insert_newOddelek = insert_newOddelek;
module.exports.getOddelek = getOddelek;
module.exports.remove_Oddelek = remove_Oddelek;
module.exports.update_newOddelek = update_newOddelek;
