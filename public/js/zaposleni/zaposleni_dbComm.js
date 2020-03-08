
// pridobi podatke o oddelkih
function submitForm_oddelekGet() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/get");
    xhr.responseType = 'json';   // cant set responseType for synchronous

    xhr.onload = function(event) {
        let serverRes = event.target.response;
        if (isIE()) {
            serverRes = JSON.parse(serverRes);
        }
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // če je error zaradi nobenega vnosa
            if (serverRes.vsiOddelki == null) {
                create_checkBox_usposobljenost_zaposleni();
            }
            // če je kak drugačen error
            else {
                console.log(serverRes.msg);
                documentObjects_zaposleni.zaposleniInputError.innerText = serverRes.msg;
            }
        }
        else {
            // shranimo v storage
            let dopOddleki = [];
            let popOddleki = []
            
            for (let m = 0; m < serverRes.vsiOddelki.length; m++) {
                const element = serverRes.vsiOddelki[m];
                if (element.smena == "dopoldne") {
                    dopOddleki.push(element);
                } else if (element.smena == "popoldne") {
                    popOddleki.push(element);
                }
            }
            // sessionStorage.setItem ("oddelki_dopoldne", JSON.stringify(dopOddleki));
            // sessionStorage.setItem ("oddelki_popoldne", JSON.stringify(popOddleki));

            // ustvarimo potrebne html elemente (checkboxe)
            create_checkBox_usposobljenost_zaposleni(serverRes.vsiOddelki);
        }
        submitForm_zaposleniGet();
    }; 
    var formData = new FormData ();

    formData.append("poslovalnica", userData.poslovalnica);
    xhr.send(formData);
}

// pridobi podatke o zaposlenih
var xhrGetZaposlene = new XMLHttpRequest();

function submitForm_zaposleniGet() {
    xhrGetZaposlene.open("POST", "/zaposleni/get");
    xhrGetZaposlene.responseType = 'json';

    xhrGetZaposlene.onload=function(event){ 
        let serverRes = event.target.response;
        if (isIE()) {
            serverRes = JSON.parse(serverRes);
        }

        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // če je error zaradi nobenega vnosa
            if (serverRes.vsiZaposleni == null) {
                create_table_osebe_zaposleni();
                create_table_zaposleniPoOddelkih();
            }
            // če je kak drugačen error
            else {
                console.log(serverRes.msg);
                onInputErrorZaposleni(serverRes.msg);
            }
            return;
        }
        else {
            // pridobimo vsa prikazana imena
            prikazanaImenaVsa = [];
            
            let vsiZap = serverRes.vsiZaposleni

            for (let m = 0; m < serverRes.vsiZaposleni.length; m++) {
                const element = serverRes.vsiZaposleni[m];
                prikazanaImenaVsa.push((element.prikazanoImeZap).toLowerCase());
                
                let usp = vsiZap[m].usposobljenostZap;
                // remove " on the start and end if there is one
                if (usp[0] === "\"") {
                    usp = usp.substr(1);
                }
                if (usp[usp.length - 1] === "\"") {
                    usp = usp.substring(0, usp.length - 1);
                }
                vsiZap[m].usposobljenostZap = JSON.parse(usp);
            }
            

            // shranimo v storage
            // sessionStorage.setItem ("zaposleni", JSON.stringify(serverRes.vsiZaposleni));

            // ustvarimo tabelo zaposlenih
            create_table_osebe_zaposleni(vsiZap);
            create_table_zaposleniPoOddelkih(vsiZap);
        }
        
        clearInputValuesZaposleni();
        onInputErrorZaposleni("");
    }; 

    var formData = new FormData ();
    
    formData.append("poslovalnica", userData.poslovalnica);
    let seznamZaposlenihDiv = document.getElementById("seznamZaposlenihDiv").innerHTML = "Nalaganje ...";

    xhrGetZaposlene.send(formData);
}

// dodamo zaposlenega v database
function submitForm_zaposleniAdd() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/zaposleni/add");
    xhr.responseType = 'json';

    xhr.onload=function(event){
        let serverRes = event.target.response;
        if (isIE()) {
            serverRes = JSON.parse(serverRes);
        }

        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // če je error zaradi nobenega vnosa
            documentObjects_zaposleni.zaposleniInputError.innerText = serverRes.msg;
            return;
        }
        else {
            submitForm_zaposleniGet();
        }
    }; 

    var formData = new FormData (document.getElementById("addZaposlneiForm"));

    usposobljenost_chkBox_Arr = document.getElementById("seznamUsposobljenosti").getElementsByTagName("input");
    usposobljenost_object = {};

    for (let i = 0; i < usposobljenost_chkBox_Arr.length; i++) {
        oddelek = usposobljenost_chkBox_Arr[i];
        usposobljenost_object[oddelek.value] = oddelek.checked;
    }
    
    formData.append("usposobljenost", JSON.stringify(usposobljenost_object));
    
    formData.append("poslovalnica", userData.poslovalnica);

    xhr.send(formData);
}


// izbrišemo zaposlenega iz database
function submitForm_zaposleniRemove(zapId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/zaposleni/remove");
    xhr.responseType = 'json';

    xhr.onload=function(event){
        let serverRes = event.target.response;
        if (isIE()) {
            serverRes = JSON.parse(serverRes);
        }

        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // če je error zaradi nobenega vnosa
            console.log(serverRes.msg);
            onError_seznamZaposlenih(serverRes.msg);
            return;
        }
        else {
            onError_seznamZaposlenih("");
            submitForm_zaposleniGet();
        }
    }; 

    var formData = new FormData ();

    formData.append("poslovalnica", userData.poslovalnica);
    formData.append("zapID", zapId);

    xhr.send(formData);
}

function submitForm_zaposleniUpdate(edit_inputFields_zaposleni) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/zaposleni/update");
    xhr.responseType = 'json';

    xhr.onload=function(event){
        let serverRes = event.target.response;
        if (isIE()) {
            serverRes = JSON.parse(serverRes);
        }

        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // če je error zaradi nobenega vnosa
            onError_seznamZaposlenih(serverRes.msg);
            return;
        }
        else {
            onError_seznamZaposlenih("");
            openRowId = "";
            originalTableRow = "";
            currentPrikazanoIme = "";
            submitForm_zaposleniGet();
        }
    }; 

    var formData = new FormData ();
    
    formData.append("poslovalnica", userData.poslovalnica);
    formData.append("zapID", edit_inputFields_zaposleni.zapID);
    formData.append("prikazanoImeZap", edit_inputFields_zaposleni.prikazanoImeZap_edit.value);
    formData.append("imeZap", edit_inputFields_zaposleni.imeZap_edit.value);
    formData.append("priimekZap", edit_inputFields_zaposleni.priimekZap_edit.value);
    formData.append("maxUrDanZap", edit_inputFields_zaposleni.maxUrDanZap_edit.value);
    formData.append("maxUrTedenZap", edit_inputFields_zaposleni.maxUrTedenZap_edit.value);
    formData.append("maxNedelijZap", edit_inputFields_zaposleni.maxNedelijZap_edit.value);
    formData.append("maxPraznikovZap", edit_inputFields_zaposleni.maxPraznikovZap_edit.value);
    formData.append("student", edit_inputFields_zaposleni.student_edit.value == "true" ? "on" : "off");
    formData.append("studentMlajsi", edit_inputFields_zaposleni.studentMlajsi_edit.value == "true" ? "on" : "off");
    
    formData.append("usposobljenost", JSON.stringify(edit_inputFields_zaposleni.usposobljenost));
    
    xhr.send(formData);
}