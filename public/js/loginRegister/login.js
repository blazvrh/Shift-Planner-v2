var userData = JSON.parse(sessionStorage.getItem("UserData"));
var imePoslovalnice = JSON.parse(sessionStorage.getItem("poslovalnica"));
const loginBlock = document.getElementById("loginBlock");
const logoutBlock = document.getElementById("logoutBlock");

// preveri če smo prijavljeni
if (!userData) {
    if (loginBlock) loginBlock.style.display = "block";
    logoutBlock.style.display = "none";
} else if (userData != null) {
    const userDataDisplay = document.getElementById("userDataDisplay");
    userDataDisplay.innerText = "Poslovalnica: " + userData.poslovalnica + "; Uporabnik: " +userData.username;
    if (loginBlock) loginBlock.style.display = "none";
    logoutBlock.style.display = "block";
} 

// za primer da smo se prijavili z računom za goste
if (window.location.pathname === "/predogledPlana" && imePoslovalnice != null && !userData) {
    const userDataDisplay = document.getElementById("userDataDisplay");
    userDataDisplay.innerText = "Poslovalnica: " + imePoslovalnice.poslovalnica;
    if (loginBlock) loginBlock.style.display = "none";
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

// izpiše potreben error
function onGuestLoginError(errorMsg, showBtn) {
    if (showBtn == null) showBtn = true;
    var loginGuestErrorMsg = document.getElementById("loginGuestErrorMsg");
    loginGuestErrorMsg.innerHTML = errorMsg;

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

// prijavi uporabnika
function loginGuest () {
    loginBlock.style.display = "none";

    const loginPoslovalnicaField = document.getElementById("loginPoslovalnicaField");
    const loginGuestPasswordField = document.getElementById("loginGuestPasswordField");

    if (loginPoslovalnicaField.value == "") {
        onGuestLoginError("Prosim vnesite ime poslovalnice!");
        loginPoslovalnicaField.focus();
        return;
    }
    else if (loginGuestPasswordField.value == "") {
        onGuestLoginError("Prosim vnesite geslo!");
        loginGuestPasswordField.focus();
        return;
    }

    onGuestLoginError("", false);
    submitForm_Login_guest();
}

// forma za navadno prijavo
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
            // window.location.href = "index.html";
            window.location.reload();
        }
    }; 

    var formData = new FormData (document.getElementById("loginForm")); 
    xhr.send(formData);
}

// forma za prijavo gosta
function submitForm_Login_guest() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/login/guest"); 

    xhr.onload=function(event){ 
        let serverRes = JSON.parse(event.target.response);
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            onGuestLoginError(serverRes.msg);
            return;
        }
        // drugače shrani uporabniške podatke in osveži stran
        else {
            sessionStorage.setItem("poslovalnica", JSON.stringify(serverRes.poslovalnica));
            // window.location.href = "index.html";
            window.location.reload();
        }
    }; 

    var formData = new FormData (document.getElementById("loginFormGuest")); 
    xhr.send(formData);
}