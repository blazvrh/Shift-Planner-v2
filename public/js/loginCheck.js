var poslov = sessionStorage.getItem("UserData");

var loginNeeded = document.getElementById("loginNeeded");
var restOfTheBody = document.getElementById("restOfBody");

if (!poslov || poslov == null) {
    loginNeeded.style.display = "initial";
    restOfTheBody.style.display = "none";
}
else if (poslov != null) {
    showRestOfBody();
}

// klicano tudi iz drugih skript
function showRestOfBody () {
    loginNeeded.style.display = "none";
    restOfTheBody.style.display = "initial";
}