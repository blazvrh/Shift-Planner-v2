const executeQuery = require("./db_init").executeQuery;
const formatQuery = require("./db_init").formatQuery;

// pridobi tedenski plan
async function get_weeklyPlan(poslovalnica, weekNum, year) {
  const query =
    "SELECT * FROM tedenskiplan WHERE poslovalnica='" +
    poslovalnica +
    "' AND weekNumer=" +
    weekNum +
    " AND year=" +
    year;

  return executeQuery(query)
    .then((res) => {
      if (res.length == 0) {
        return { isError: true, msg: "Ni vnosa za ta teden!" };
      }

      return {
        isError: false,
        msg: "Success",
        weekData: res[0],
      };
    })
    .catch((err) => {
      console.log(err);

      if (err.code == "ER_NO_SUCH_TABLE") {
        result = { isError: true, msg: "Ni najdenega vnosa!" };
      }

      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

// pridobi nedelje v letu
async function get_sundaysInYear(userData) {
  const query =
    "SELECT sundayData FROM tedenskiplan WHERE poslovalnica='" +
    userData.poslovalnica +
    "' AND year=" +
    userData.sundayYear;

  return executeQuery(query)
    .then((res) => {
      const sundays = [];
      for (let i = 0; i < res.length; i++) {
        if (res[i].sundayData && res[i].sundayData !== "") {
          sundays.push(res[i].sundayData);
        }
      }

      return { isError: false, msg: "", allSundays: sundays };
    })
    .catch((err) => {
      console.log(err);
      if (err.code == "ER_NO_SUCH_TABLE") {
        result = { isError: true, msg: "Ni najdenega vnosa!" };
      }

      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

// pridobi praznike v letu
async function get_holidaysInYear(userData) {
  const query =
    "SELECT praznikiData FROM tedenskiplan WHERE poslovalnica='" +
    userData.poslovalnica +
    "' AND year=" +
    userData.year;

  return executeQuery(query)
    .then((res) => {
      holidays = [];
      for (let i = 0; i < res.length; i++) {
        if (res[i].praznikiData && res[i].praznikiData !== "") {
          holidays.push(res[i].praznikiData);
        }
      }

      return { isError: false, msg: "", allHolidays: holidays };
    })
    .catch((err) => {
      console.log(err);
      if (err.code == "ER_NO_SUCH_TABLE") {
        result = { isError: true, msg: "Ni najdenega vnosa!" };
      }

      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

// shranimo tedenski plan
async function save_weeklyPlan(weekInfo, planData, oddelkiDop, oddelkiPop) {
  let existingData = await get_weeklyPlan(
    weekInfo.poslovalnica,
    weekInfo.weekNum,
    weekInfo.year
  );
  let dataExists = existingData.weekData != null;

  if (dataExists) {
    const query = formatQuery(
      "UPDATE tedenskiplan SET weekData = ?, oddelkiDop = ?, oddelkiPop = ?, " +
        "sundayData = ?, praznikiData = ? WHERE poslovalnica ='" +
        weekInfo.poslovalnica +
        "' AND weekNumer =" +
        weekInfo.weekNum +
        " AND year =" +
        weekInfo.year,
      [
        planData,
        oddelkiDop,
        oddelkiPop,
        weekInfo.sundayData,
        weekInfo.praznikiData,
      ]
    );

    return executeQuery(query)
      .then((res) => {
        if (res.affectedRows == 0) {
          console.log(res);
          return { isError: true, msg: "Nepričakovana napaka" };
        }

        return { isError: false, msg: "Success", inserted: res };
      })
      .catch((err) => {
        console.log(err);
        return { isError: true, msg: "Nepričakovana napaka" };
      });
  } else {
    const query = formatQuery(
      "INSERT INTO tedenskiplan (poslovalnica, weekNumer, year, " +
        "mondayDate, weekData, oddelkiDop, oddelkiPop, sundayData, praznikiData) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        weekInfo.poslovalnica,
        weekInfo.weekNum,
        weekInfo.year,
        weekInfo.mondayDate,
        planData,
        oddelkiDop,
        oddelkiPop,
        weekInfo.sundayData,
        weekInfo.praznikiData,
      ]
    );

    return executeQuery(query)
      .then((res) => {
        if (res.affectedRows == 0) {
          console.log(res);
          return { isError: true, msg: "Nepričakovana napaka" };
        }

        return { isError: false, msg: "Success", inserted: res };
      })
      .catch((err) => {
        console.log(err);
        return { isError: true, msg: "Nepričakovana napaka" };
      });
  }
}

// // shranimo tedenski plan
// async function save_temp(data, username) {
//   const query = formatQuery("INSERT INTO temp (data) VALUES (?)", [data, username]);

//   return executeQuery(query)
//     .then((res) => {
//       if (res.affectedRows == 0) {
//         console.log(res);
//         return { isError: true, msg: "Nepričakovana napaka" };
//       }

//       return { isError: false, msg: "Success", inserted: res };
//     })
//     .catch((err) => {
//       console.log(err);
//       return { isError: true, msg: "Nepričakovana napaka" };
//     });
// }

// shranimo tedenski plan
async function save_temp(req) {
  const data = req.headers.referer;
  const origin = req.headers.origin;
  const username = getcookie(req)["user"];
  const current_date = new Date();

  const query = formatQuery("INSERT INTO temp (data, UserName, Date, Origin) VALUES (?, ?, ?, ?)", [data, username, current_date, origin]);

  return executeQuery(query)
    .then((res) => {
      if (res.affectedRows == 0) {
        console.log(res);
        // return { isError: true, msg: "Nepričakovana napaka" };
      }

      return { isError: false, msg: "Success", inserted: res };
    })
    .catch((err) => {
      console.log(err);
      // return { isError: true, msg: "Nepričakovana napaka" };
      return { isError: false, msg: "Success", inserted: res };
    });
}

function getcookie(req) {
  var cookie = req.headers.cookie;
  // user=someone; session=mySessionID
  const cookies_list = cookie.split('; ');
  const cookie_dict = {}
  for (let i = 0; i < cookies_list.length; i++) {
    key = cookies_list[i].split("=")[0]
    val = cookies_list[i].substring(key.length + 1)
    cookie_dict[key] = val
  }
  return cookie_dict
}

module.exports.get_sundaysInYear = get_sundaysInYear;
module.exports.get_holidaysInYear = get_holidaysInYear;
module.exports.get_weeklyPlan = get_weeklyPlan;
module.exports.save_weeklyPlan = save_weeklyPlan;
module.exports.save_temp = save_temp;
