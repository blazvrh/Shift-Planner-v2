var poslov = sessionStorage.getItem("UserData");
var imePoslovalnice = sessionStorage.getItem("poslovalnica");

var loginNeeded = document.getElementById("loginNeeded");
var restOfTheBody = document.getElementById("restOfBody");

if ((!poslov || poslov == null) && (!imePoslovalnice || imePoslovalnice == null)) {
    loginNeeded.style.display = "block";
    restOfTheBody.style.display = "none";
    
}
else if (poslov != null || imePoslovalnice != null) {
    showRestOfBody();
}

// klicano tudi iz drugih skript
function showRestOfBody () {
    loginNeeded.style.display = "none";
    restOfTheBody.style.display = "block";
}