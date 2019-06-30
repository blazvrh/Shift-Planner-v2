var userData = JSON.parse(sessionStorage.getItem("UserData"));
var imePoslovalnice = "";

const loginBlock = document.getElementById("loginBlock");
const logoutBlock = document.getElementById("logoutBlock");

// preveri če smo prijavljeni
if (!userData) {
    if (sessionStorage.getItem("poslovalnica") !== null) {
        imePoslovalnice = JSON.parse(sessionStorage.getItem("poslovalnica")).poslovalnica;
    }
    
    if (loginBlock) loginBlock.style.display = "block";
    logoutBlock.style.display = "none";
} else if (userData != null) {
    imePoslovalnice = userData.poslovalnica;
    
    const userDataDisplay = document.getElementById("userDataDisplay");
    userDataDisplay.innerText = "Poslovalnica: " + userData.poslovalnica + "; Uporabnik: " +userData.username;
    if (loginBlock) loginBlock.style.display = "none";
    logoutBlock.style.display = "block";
} 

// za primer da smo se prijavili z računom za goste
if ((window.location.pathname === "/predogledGosti" || window.location.pathname === "/predogledGosti.html") && imePoslovalnice !== "" && !userData) {
    const userDataDisplay = document.getElementById("userDataDisplay");
    userDataDisplay.innerText = "Poslovalnica: " + imePoslovalnice;
    if (loginBlock) loginBlock.style.display = "none";
    logoutBlock.style.display = "block";
    
}

// izpiše potreben error
function onLoginError(errorMsg, showBtn) {
    if (showBtn == null) showBtn = true;
    var loginErrorMsg = document.getElementById("loginErrorMsg");
    loginErrorMsg.innerHTML = errorMsg;
    
    if (showBtn) {
        document.getElementById("loginBtn").disabled = false;
    }
}

// izpiše potreben error
function onGuestLoginError(errorMsg, showBtn) {
    if (showBtn == null) showBtn = true;
    var loginGuestErrorMsg = document.getElementById("loginGuestErrorMsg");
    loginGuestErrorMsg.innerHTML = errorMsg;

    if (showBtn) {
        document.getElementById("loginGuestBtn").disabled = false;
        
        // loginBlock.style.display = "initial";
    }
}

// odjavi uporabnika
function logout() {
    // let canceled = false;
    if (window.location.pathname === "/urediTrenitenPlan" || window.location.pathname === "/urediTrenitenPlan.html") {
        if (!dataSaved) {
            let answer = window.confirm("Ali ste prepričani, da želite zapustiti stran? Pri tem lahko izgubite neshranjene podatke, ki ste jih vnesli.");
            if(answer) {
                sessionStorage.clear();
                window.location.href = "index.html";
                document.getElementById("logoutBlock").getElementsByTagName("button")[0].disabled = true;
                window.onbeforeunload = function (e) { }
            }
        }
        else {
            document.getElementById("logoutBlock").getElementsByTagName("button")[0].disabled = true;
            sessionStorage.clear();
            window.location.href = "index.html";
        }
    }
    else {
        document.getElementById("logoutBlock").getElementsByTagName("button")[0].disabled = true;
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}

// prijavi uporabnika
function login () {
    // loginBlock.style.display = "none";
    document.getElementById("loginBtn").disabled = true;

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
    // loginBlock.style.display = "none";
    document.getElementById("loginGuestBtn").disabled = true;

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