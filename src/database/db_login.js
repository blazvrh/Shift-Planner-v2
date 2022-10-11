const bcrypt = require("bcryptjs");
const executeQuery = require("./db_init").executeQuery;

async function checkForLoginInfo(inputUserData) {
  const query =
    "SELECT username, password, verified, poslovalnica FROM users WHERE BINARY username='" +
    inputUserData.username +
    "'";

  return executeQuery(query)
    .then((res) => {
      if (res.length == 0) {
        return { isError: true, msg: "Ta uporabnik ne obstaja!" };
      }

      const passwordMatch = bcrypt.compareSync(
        inputUserData.password,
        res[0].password
      );
      if (!passwordMatch) {
        return {
          isError: true,
          msg: "Nepravilno uporabniško ime ali geslo!",
        };
      }

      if (res[0].verified == 0) {
        return {
          isError: true,
          msg: "Uporabniški račun ni potrjen. Obrnite se na administratorja!",
        };
      }

      return {
        isError: false,
        msg: "Success",
        userData: {
          username: res[0].username,
          poslovalnica: res[0].poslovalnica,
        },
      };
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

async function checkForLoginInfo_guest(inputUserData) {
  const query =
    "SELECT poslovalnica, previewPassword FROM users WHERE BINARY poslovalnica='" +
    inputUserData.poslovalnica +
    "'";

  return executeQuery(query)
    .then((res) => {
      if (res.length == 0) {
        return { isError: true, msg: "Ta poslovalnica ne obstaja!" };
      }

      const passwordMatch = bcrypt.compareSync(
        inputUserData.passwordGuest,
        res[0].previewPassword
      );
      if (!passwordMatch) {
        return {
          isError: true,
          msg: "Nepravilna poslovalnica ali geslo!",
        };
      }

      if (res[0].verified == 0) {
        return {
          isError: true,
          msg: "Uporabniški račun ni potrjen. Obrnite se na administratorja!",
        };
      }

      return {
        isError: false,
        msg: "Success",
        poslovalnica: {
          poslovalnica: res[0].poslovalnica,
        },
      };
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

module.exports.checkForLoginInfo = checkForLoginInfo;
module.exports.checkForLoginInfo_guest = checkForLoginInfo_guest;
