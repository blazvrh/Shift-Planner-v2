const bcrypt = require("bcryptjs");
const executeQuery = require("./db_init").executeQuery;
const formatQuery = require("./db_init").formatQuery;

async function checkForDuplicate(userData) {
  const usernameCheck = await checkForUsernameDuplicate(userData.username);

  if (usernameCheck.isError) {
    return usernameCheck;
  }

  const businessUnitCheck = await checkForBusinessUnitDuplicate(
    userData.poslovalnica
  );

  if (businessUnitCheck.isError) {
    return businessUnitCheck;
  }

  return { isError: false, msg: "" };
}

async function checkForUsernameDuplicate(username) {
  const query = "SELECT username FROM users WHERE username='" + username + "'";

  const usernameCheck = executeQuery(query)
    .then((res) => {
      if (res.length == 0) {
        return { isError: false, msg: "" };
      } else {
        return {
          isError: true,
          msg: "Uporabniško ime že obstaja. Prosim izberite drugo uporabniško ime!",
        };
      }
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });

  return usernameCheck;
}

async function checkForBusinessUnitDuplicate(businessUnit) {
  const query =
    "SELECT username FROM users WHERE poslovalnica='" + businessUnit + "'";

  const businessUnitCheck = executeQuery(query)
    .then((res) => {
      if (res.length == 0) {
        return { isError: false, msg: "" };
      } else {
        return {
          isError: true,
          msg: "Poslovalnica že obstaja. Prosim izberite drugo ime poslovalnice!",
        };
      }
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });

  return businessUnitCheck;
}

async function insertNewUser(userData) {
  const passwordUserHashed = bcrypt.hashSync(userData.password, 10);
  const passwordPreviewHashed = bcrypt.hashSync(userData.previewPassword, 10);

  const query = formatQuery(
    "INSERT INTO users (username, password, poslovalnica, previewPassword, " +
      "email, verified) VALUES (?, ?, ?, ?, ?, ?)",
    [
      userData.username,
      passwordUserHashed,
      userData.poslovalnica,
      passwordPreviewHashed,
      userData.email,
      1, // Auto verified
    ]
  );
  return executeQuery(query)
    .then((res) => {
      if (res.affectedRows != 0) {
        return {
          isError: false,
          msg: "Success",
          userData: {
            username: userData.username,
            poslovalnica: userData.poslovalnica,
          },
        };
      } else {
        console.log(res);
        return { isError: true, msg: "Nepričakovana napaka" };
      }
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });
}

module.exports.checkForDuplicate = checkForDuplicate;
module.exports.insertNewUser = insertNewUser;
