const intervalTimer = 1000 * 60 * 10;

function startStayAwake() {
  // Prevent render.com application to go to sleep while on the page
  const stayAwakeInterval = setInterval(() => {
    stayAwakeCall();
  }, intervalTimer);
}

function stayAwakeCall() {
    const request = new XMLHttpRequest();
    request.open("GET", "/api/stay-awake", true);
    request.send(null);
}
