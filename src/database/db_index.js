const executeQuery = require("./db_init").executeQuery;
const formatQuery = require("./db_init").formatQuery;

async function insert_newPredlog(predlogData) {
  const query = formatQuery("INSERT INTO `predlogi` (predlogText) VALUES (?)", [
    predlogData.predlogTxt,
  ]);

  const result = executeQuery(query)
    .then((res) => {
      if (res.affectedRows == 0) {
        console.log(res);
        return { isError: true, msg: "Nepričakovana napaka" };
      }

      return { isError: false, msg: "Success" };
    })
    .catch((err) => {
      console.log(err);
      return { isError: true, msg: "Nepričakovana napaka" };
    });

  return result;
}

module.exports.insert_newPredlog = insert_newPredlog;
