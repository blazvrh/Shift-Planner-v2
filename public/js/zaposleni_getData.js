
var userUID;

// pridobi podatke o zaposlenih iz firebase in ustvari tabelo
function UpdateZaposleniTableIzFirebase () {
    var zaposleniTable = document.getElementById("zaposleniTable");
    zaposleniTable.innerHTML = "<tr><td>Nalaganje ...</td></tr>";

    // pridobivanje podatkov iz baze
    firebaseRef = firebase.database().ref().child("users").child(userUID).child("zaposleni");

    firebaseRef.once("value", (snapData) => {
        
        let vsiZaposleni = [];
        let keyPrikazanoImeMatch = {};

        snapData.forEach(element => {
            let usposobljenost = {};
            element.child("usposobljenost").forEach(element => {
                usposobljenost [element.key] = element.val();
            });

            keyPrikazanoImeMatch[element.child("priakzanoIme").val()] = element.key;

            const zaposlenaOseba = {
                key: element.key,
                imeZaposlenega: element.child("imeZaposlenega").val(),
                priimekZaposlenega: element.child("priimekZaposlenega").val(),
                priakzanoIme: element.child("priakzanoIme").val(),
                maxUrDan: element.child("maxUrDan").val(),
                maxUrTeden: element.child("maxUrTeden").val(),
                maxNedelij: element.child("maxNedelij").val(),
                maxPraznikov: element.child("maxPraznikov").val(),
                student: element.child("student").val(),
                studentMlajsi: element.child("studentMlajsi").val(),
                usposobljenost: usposobljenost
            };

            vsiZaposleni.push(zaposlenaOseba);
        });

        // ustvarjanje tabele
        zaposleniTable.innerHTML = "";
        let trHeader = createHeaderRowZaSeznamZaposlenih();
        zaposleniTable.append(trHeader);

        vsiZaposleni.forEach(element => {
            trEl = createTrElementZaSeznamZaposlenih(element);

            zaposleniTable.append(trEl);
        });

        // shranimo
        zaposleni_keyNameMatch = keyPrikazanoImeMatch;
        sessionStorage.setItem ("zaposleni_keyNameMatch", JSON.stringify(keyPrikazanoImeMatch));
        
        // to je zadnja stvar, zato potem pokažemo vsebino strani
        showPageContent_zaposleni();
    });
}

// ustvari header za tabelo zaposlenih
function createHeaderRowZaSeznamZaposlenih () {
    let trEl = document.createElement("tr");

    let headerTexts = ["Prikazano Ime", "Ime", "Priimek", "Ur/dan", "Ur/teden", "Nedelje", "Prazniki", 
        "Študent", "Mlajši od 16 let"];

    let oddelki = JSON.parse(sessionStorage.getItem("vsaImenaOddelkov"));

    for (let i = 0; i < oddelki.length; i++) {
        headerTexts.push (oddelki[i]);
    }
    headerTexts.push ("Urejanje:");
    headerTexts.push ("Brisanje:");

    for (let i = 0; i < headerTexts.length; i++) {
        let thEl = document.createElement("th");
        thEl.innerText = headerTexts[i];
        trEl.append (thEl);
    }

    return trEl;
}

// ustvari vrstico za v tabelo zaposlenih
function createTrElementZaSeznamZaposlenih (dataElement) {
    trElement = document.createElement("tr");

    tdTexts = [];
    
    tdTexts.push(dataElement.priakzanoIme);
    tdTexts.push(dataElement.imeZaposlenega);
    tdTexts.push(dataElement.priimekZaposlenega);
    tdTexts.push(dataElement.maxUrDan);
    tdTexts.push(dataElement.maxUrTeden);
    tdTexts.push(dataElement.maxNedelij);
    tdTexts.push(dataElement.maxPraznikov);
    tdTexts.push(dataElement.student ? "Da" : "Ne");
    tdTexts.push(dataElement.studentMlajsi ? "Da" : "Ne");

    for (let i = 0; i < tdTexts.length; i++) {
        let tdEl = document.createElement("td");
        tdEl.innerText = tdTexts[i];
        trElement.append (tdEl);
    }

    let usposobl = dataElement.usposobljenost;
    let oddelki = JSON.parse(sessionStorage.getItem("vsaImenaOddelkov"));

    for (let i = 0; i < oddelki.length; i++) {
        jeUsposobljen = usposobl[oddelki[i]];

        if (!jeUsposobljen) {
            jeUsposobljen = false;
        }
        
        let dtUsposobljenost = document.createElement("td");
        let jeUsposobljenSlo = jeUsposobljen ? "Da" : "Ne";
        dtUsposobljenost.innerText = jeUsposobljenSlo;

        trElement.append(dtUsposobljenost);
    }



    return trElement;
}

// pridobi oddleke za katere je potrebna usposobljenost
function getPrimerneOddelke() {
    let oddDataDop = JSON.parse(sessionStorage.getItem("oddelki_dopoldne"));
    let oddDataPop = JSON.parse(sessionStorage.getItem("oddelki_popoldne"));

    oddelkiNames = [];

    oddDataDop.forEach(element => {
        oddName = element.imeOddelka;
        specialOdd = element.specialOddelek;
        if (specialOdd == "" && !oddelkiNames.includes(oddName)) {
            oddelkiNames.push(oddName);
        }
    });

    oddDataPop.forEach(element => {
        oddName = element.imeOddelka;
        specialOdd = element.specialOddelek;
        if (specialOdd == "" && !oddelkiNames.includes(oddName)) {
            oddelkiNames.push(oddName);
        }
    });

    sessionStorage.setItem("vsaImenaOddelkov", JSON.stringify(oddelkiNames));

    return oddelkiNames;
}

// ime funkcije pove vse ... ustvari seznam checkboxov za usposobljenost
function ustvariTabeloUsposobljenosti () {
    let seznamUsposobljenosti = document.getElementById("seznamUsposobljenosti");
    seznamUsposobljenosti.innerHTML = "";
    let vsiOddelki = getPrimerneOddelke();

    vsiOddelki.forEach(element => {

        let trElement = document.createElement("tr");
        let tdElement = document.createElement("td");
        let labelElement = document.createElement("label");
        let chkBox = document.createElement("input");
        
        chkBox.setAttribute("type", "checkbox");

        labelElement.append(chkBox);
        labelElement.append(element);
        tdElement.append(labelElement);
        trElement.append(tdElement);
        seznamUsposobljenosti.append(trElement);
    });

    UpdateZaposleniTableIzFirebase();
}

// pridobi informacije o oddelkih
function getOddelekDataFromFirebase (smena) {
    var firebaseRef = firebase.database().ref().child("users").child(userUID).
    child("oddelki").child(smena);
    
    firebaseRef.once("value", (snapData) => {
        let oddelek = {};
        let vsiOddelki = [];
        
        let childCount = 0;

        snapData.forEach(element => {
            childCount ++;
            oddelek = {
                key: element.key,
                imeOddelka: element.child("imeOddelka").val(),
                stVrsticOddelka: element.child("stVrsticOddelka").val(),
                prihodNaOddelek: element.child("prihodNaOddelek").val(),
                odhodIzOddelka: element.child("odhodIzOddelka").val(),
                specialOddelek: element.child("specialOddelek").val()
            }
            vsiOddelki.push(oddelek);
        });
        
        if (childCount == 0) {
            alert("ni oddelkov")
        } else {
            let storageFormat = JSON.stringify(vsiOddelki);
            sessionStorage.setItem ("oddelki_" + smena, storageFormat);
        }

        dataToCheck --;
    });
}

// pridobi ime poslovalnice
function getPoslovalnicaFromFirebase (user) {
    let poslovalnica = user.displayName;
    sessionStorage.setItem("poslovalnica", poslovalnica);

    showRestOfBody();
    dataToCheck --;
}


var dataToCheck = 3;

// pridobi vse potrebne podatke
function checkForData (user) {
    
    if (sessionStorage.getItem("poslovalnica") == null) {
        getPoslovalnicaFromFirebase(user);
    } else {
        dataToCheck --;
    }
    if (sessionStorage.getItem("oddelki_dopoldne") == null) {
        getOddelekDataFromFirebase ("dopoldne");
    } else {
        dataToCheck --;
    }
    if (sessionStorage.getItem("oddelki_popoldne") == null) {
        getOddelekDataFromFirebase ("popoldne");
    } else {
        dataToCheck --;
    }

    // UpdateZaposleniTableIzFirebase();

    // počakamo na potrebne podatke
    var waitForNececceryData = setInterval(() => {
        if (dataToCheck == 0) {
            // ustvari checkbox-e za seznam uspobobljenosti
            ustvariTabeloUsposobljenosti();

            clearInterval(waitForNececceryData);
        }
    }, 300);
}

function showPageContent_zaposleni() {
    // prikažemo dejansko stran
    let loadingDataDiv = document.getElementById("loadingData");
    let mainDiv = document.getElementById("mainDiv");

    loadingDataDiv.style.display = "none";
    mainDiv.style.display = "initial";
}

// počaka da se firebase vspostavi in nato shrani user id
var checkForFirebaseConn = setInterval(() => {

    var userInst = firebase.auth().currentUser;

    if(userInst) {
        userUID = userInst.uid;
        checkForData(userInst);

        clearInterval(checkForFirebaseConn);
    }
}, 300);