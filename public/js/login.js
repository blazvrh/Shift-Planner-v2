var userData = JSON.parse(sessionStorage.getItem("UserData"));
const loginBlock = document.getElementById("loginBlock");
const logoutBlock = document.getElementById("logoutBlock");

// preveri če smo prijavljeni
if (!userData) {
    loginBlock.style.display = "block";
    logoutBlock.style.display = "none";
} else {
    const userDataDisplay = document.getElementById("userDataDisplay");
    userDataDisplay.innerText = userData.username + ", poslovalnica: " + userData.poslovalnica;
    loginBlock.style.display = "none";
    logoutBlock.style.display = "block";
}

// izpiše potreben error
function onLoginError(errorMsg, showBtn) {
    if (showBtn == null) showBtn = true;
    var loginErrorMsg = document.getElementById("loginErrorMsg");
    loginErrorMsg.innerHTML = errorMsg;

    if (showBtn) {
        loginBlock.style.display = "initial";
    }
}

// odjavi uporabnika
function logout() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

// prijavi uporabnika
function login () {
    loginBlock.style.display = "none";

    const loginUsernameField = document.getElementById("loginUsernameField");
    const loginPasswordField = document.getElementById("loginPasswordField");

    if (loginUsernameField.value == "") {
        onLoginError("Prosim vnesite vaše uporabniško ime!");
        loginUsernameField.focus();
        return;
    }
    else if (loginPasswordField.value == "") {
        onLoginError("Prosim vnesite vaše geslo!");
        loginPasswordField.focus();
        return;
    }

    onLoginError("", false);
    submitForm_Login();
}

function submitForm_Login() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/login"); 

    xhr.onload=function(event){ 
        let serverRes = JSON.parse(event.target.response);
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            onLoginError(serverRes.msg);
            return;
        }
        // drugače shrani uporabniške podatke in pojdi na index
        else {
            sessionStorage.setItem("UserData", JSON.stringify(serverRes.userData));
            window.location.href = "index.html";
        }
    }; 

    var formData = new FormData (document.getElementById("loginForm")); 
    xhr.send(formData);
}