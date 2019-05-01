
// izpiše error kadar rabimo
function onRegisterError(msg, showBtn) {
    if (showBtn == null) showBtn = true;

    var errorMsg = document.getElementById("errorMsgRegister");
    errorMsg.innerText = msg;
    
    if (showBtn) {
        var registerBtn = document.getElementById("registerBtn");
        registerBtn.style.display = "initial";
    }
}

// kopirano iz interneta; validacija email oblike
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// funkcija za registracijo novega uporabnika - ime funkcije vse pove 
function btn_register () {
    var registerBtn = document.getElementById("registerBtn");
    registerBtn.style.display = "none";

    var newUserName = document.getElementById("userNameField");
    var newPassword1 = document.getElementById("passwordField1");
    var newPassword2 = document.getElementById("passwordField2");
    var poslovalnica = document.getElementById("poslovalnica");
    var prewievPassword1 = document.getElementById("prewiewPasswordField1");
    var prewievPassword2 = document.getElementById("prewiewPasswordField2");
    var newEmail = document.getElementById("emailField");
    
    // input value check
    // preveri za prazna polja
    if (poslovalnica.value == "" || newUserName.value == "" || newPassword1.value == "" 
        || prewievPassword1.value == ""){

        onRegisterError("Prosim izpolnite vsa polja označena z zvezdico!");
        return;
    }
    // preveri dolžino uporabniškega imena
    else if (newUserName.value.length < 4) {
        onRegisterError ("Uporabniško ime mora biti dolgo vsaj 4 znake!");
        newUserName.focus();
        return;
    }
    // preveri dolžino glavnega gesla
    else if (newPassword1.value.length < 6) {
        onRegisterError ("Geslo mora biti dolgo vsaj 6 znakov!");
        newPassword1.focus();
        return;
    }
    // preveri main password match
    else if (newPassword1.value != newPassword2.value){
        onRegisterError ("Gesli se ne ujemata! Prosim popravite vnos!");
        newPassword2.focus();
        return;
    }
    // preveri dolžino gesla za predogled
    else if (prewievPassword1.value.length < 6) {
        onRegisterError ("Geslo za predogled mora biti dolgo vsaj 6 znakov!");
        prewievPassword1.focus();
        return;
    }
    // preveri če se gesli za predogled ujemata
    else if (prewievPassword1.value != prewievPassword2.value){
        onRegisterError ("Gesli za predogled se ne ujemata! Prosim popravite vnos!");
        prewievPassword2.focus();
        return;
    }
    // preveri če je mail pravilno formiran
    else if (newEmail.value != "" && !validateEmail(newEmail.value)){
        onRegisterError ("Nepravilen format email-a! Prosim popravite vnos!");
        newEmail.focus();
        return;
    }

    onRegisterError("", false);

    // pošljemo podatke serverju
    submitForm_Register();
}

// pošlje formo serverju
function submitForm_Register() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/register"); 

    xhr.onload=function(event){ 
        let serverRes = JSON.parse(event.target.response);
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            onRegisterError(serverRes.msg);
            return;
        }
        // drugače shrani uporabniške podatke in pojdi na index
        else {
            // sessionStorage.setItem("UserData", JSON.stringify(serverRes.userData));
            window.location.href = "index.html";
        }
    }; 

    var formData = new FormData (document.getElementById("registerForm")); 
    xhr.send(formData);
}