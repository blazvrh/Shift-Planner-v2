var request = require("request");

function ping() {
  //   const intervalTime = 1000 * 60 * 10;
  const intervalTime = 1000 * 60;
    const url = "https://plan-dela.onrender.com/api/stay-awake";
//   const url = "api/stay-awake";

  const pingInterval = setInterval(() => {
    request(url, function (error, response, body) {
      console.log(body);
    });
  }, intervalTime);
}

module.exports.ping = ping;
