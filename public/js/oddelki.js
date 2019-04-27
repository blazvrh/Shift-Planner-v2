
// some varibles
let userUID;

const smenaOddelka = document.getElementById("smenaOddelka");
const imeOddelka = document.getElementById("imeOddelka");
const stVrsticOddelka = document.getElementById("stVrsticOddelka");
const prihodNaOddelek = document.getElementById("prihodNaOddelek")
const odhodIzOddelka = document.getElementById("odhodIzOddelka");
const specialOddelek = document.getElementById("specialOddelek");
const oddelkiErrorMsg = document.getElementById("oddelekInputError");

const btn_dodajOddelek = document.getElementById("btn_dodajOddelek");

// gumb za dodajanje oddlek
function btnDodajOddelek ()
{
    btn_dodajOddelek.style.display = "none";
    checkInputValues();
}

// izpiše error
function onInputError(msg, showBtn) {
    oddelkiErrorMsg.innerHTML = msg;
    if (showBtn) {
        btn_dodajOddelek.style.display = "initial";
    }
}

// preveri če so vsa potrebna polja polna
function checkInputValues()
{
    if (imeOddelka.value == ""){
        onInputError("Prosim vnesite ime oddelka!", true);
        imeOddelka.focus();
        return;
    }
    else if(smenaOddelka.value == "") {
        onInputError("Prosim izberite čas izmene!", true);
        smenaOddelka.focus();
        return;
    }
    else if(stVrsticOddelka.value == ""){
        onInputError("Prosim vnesite št. vrstic za ta oddelek!", true);
        stVrsticOddelka.focus();
        return;
    }
    else if (parseInt(stVrsticOddelka.value) < 1)
    {
        onInputError("Št. vrstic za oddelek mora biti pozitivna vrednost!", true);
        stVrsticOddelka.focus();
        return;
    }

    if (specialOddelek.value == "") {
        if(prihodNaOddelek.value == ""){
            onInputError("Prosim vneiste običajni čas prihoda za oddelek!", true);
            prihodNaOddelek.focus();
            return;
        }
        else if(odhodIzOddelka.value == ""){
            onInputError("Prosim vneiste običajni čas odhoda za oddelek!", true);
            odhodIzOddelka.focus();
            return;
        }

        let prihodDate = getDateFromTimeString(prihodNaOddelek.value);
        let odhodDate = getDateFromTimeString(odhodIzOddelka.value);
        if (prihodDate >= odhodDate)
        {
            onInputError("Čas prihoda za oddelek mora biti manjši od časa odhoda za oddelek!", true);
            prihodNaOddelek.focus();
            return;
        }
    }
    else {
        prihodNaOddelek.value = "";
        odhodIzOddelka.value = "";
    }
    
    onInputError("", false);
    dodajVFirebase();
}

// vrne datum iz podanega stringa v obliki "hh:mm"
function getDateFromTimeString(timeString) {
    let timeSplited = timeString.split(":");
    let hour = parseInt(timeSplited[0]);
    let minute = parseInt(timeSplited[1]);
    
    let date = new Date();
    date.setHours(hour, minute, 0);
    
    return date;
}

// pobriše vse input vrednosti
function clearInputValues() {
    smenaOddelka.value = "";
    imeOddelka.value = "";
    stVrsticOddelka.value = "";
    prihodNaOddelek.value = "";
    odhodIzOddelka.value = "";
    specialOddelek.value = "";
    oddelkiErrorMsg.value = "";
}

// dodamo nov vnos v firebase database
function dodajVFirebase () {
    // če ni UserId potem je nekaj narobe
    if (userUID == null) {
        onInputError("Ni vspostavljene povezave s strežnikom!s\nPreverite internetno povezavo in poiskusite znova.", true);
        return;
    }
    var firebaseRef = firebase.database().ref().child("users").child(userUID).
        child("oddelki").child(smenaOddelka.value);
    var oddelekKey = firebaseRef.push().key;

    let oddelek = {
        imeOddelka: imeOddelka.value,
        stVrsticOddelka: stVrsticOddelka.value,
        prihodNaOddelek: prihodNaOddelek.value,
        odhodIzOddelka: odhodIzOddelka.value,
        specialOddelek: specialOddelek.value
    };

    firebaseRef.child(oddelekKey).set(oddelek).then((r) => {
        updateTable(smenaOddelka.value.toString());
        clearInputValues();
        btn_dodajOddelek.style.display = "initial";
    });
}

// posodobi tabelo oddelkov; shrani jih tudi v session storage
function updateTable (smena) {
    const Table = document.getElementById(smena + "TabelBody");

    var firebaseRef = firebase.database().ref().child("users").child(userUID).
    child("oddelki").child(smena);

    
    firebaseRef.once("value", (snapData) => {
        let oddelek = {};
        let vsiOddelki = [];
        snapData.forEach(element => {
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
        
        let endHtmlText = "<tr><td>Ni vnosa ... </td></tr>";
        if (vsiOddelki.length > 0) {
            endHtmlText = "<tr><td>Oddelek:</td><td>Čas prihoda:</td><td>Čas odhoda:</td>" +
                "<td>Št. vrstic:</td><td>Posebnost:</td><td>Urejanje:</td><td>Brisanje:</td></tr>";
        }
        vsiOddelki.forEach ((odd) => {
            let specialOdd = odd.specialOddelek;
            if (specialOdd == "") {
                specialOdd = "/";
            }

            let prihod = odd.prihodNaOddelek;
            if (prihod == "") prihod = "/";
            let odhod = odd.odhodIzOddelka;
            if (odhod == "") odhod = "/";

            endHtmlText += "<tr id=\"" + odd.key + "\"><td  id='text'>" + odd.imeOddelka + "</td>" +
                "<td id='time'>" + prihod + "</td>" +
                "<td id='time'>" + odhod + "</td>" +
                "<td  id='number'>" + odd.stVrsticOddelka + "</td>" +
                "<td id='select'>" + specialOdd + "</td>" +
                "<td id='editBtn'><button value = " + odd.key + 
                    " onclick = \"btn_odpriUrediOddelek('" + smena + "', this.value)\">" +
                    "Uredi!</button></td>" +
                "<td id='removeBtn'><button class='btnRemoveOdd' value = " + odd.key + 
                    " onclick = \"removeOddelekFromFirebase('" + smena + "', this.value)\">" +
                    "Odstrani!</button></td></tr>";
        });
        Table.innerHTML = endHtmlText;
        
        let storageFormat = JSON.stringify(vsiOddelki);
        sessionStorage.setItem ("oddelki_" + smena, storageFormat);
    });
}

// odstrani vrednost iz firebase database + posodobi tabele
function removeOddelekFromFirebase (smena, itemKey) {
    var removeRef = firebase.database().ref().child("users").child(userUID).child("oddelki").child(smena).child(itemKey);
    removeRef.remove().then((s) => {
        updateTable(smena);
    });
}

/// urejanje obstoječih oddelkov
// shranimo table row, da se ponastavi če prekičemo
var openRowId = "";
var originalTableRow = "";

// odpre urejanje oddelka
function btn_odpriUrediOddelek (smena, oddelekId) {
    // če imamo eno urejanje že odprto in izberemo drugo, zapremo prvo
    if (originalTableRow != "") {
        let openRow = document.getElementById(openRowId);
        openRow.innerHTML = originalTableRow;
        onEditError("popoldne", "");
        onEditError("dopoldne", "");
    }
    
    openRowId = oddelekId;
    let tableObj = document.getElementById(oddelekId);
    originalTableRow = tableObj.innerHTML;

    let editingTd = tableObj.getElementsByTagName("td");

    for (let i = 0; i < editingTd.length; i++) {
        let tdID = editingTd[i].id;
        
        // ustvarimo posebnost oddelka
        if (tdID == "select") {
            let inputElement = document.createElement("select");
            inputElement.setAttribute("type", tdID);

            let option1 = document.createElement("option");
            option1.value = "";
            option1.text = "/";
            let option2 = document.createElement("option");
            option2.value = "Komentar";
            option2.text = "Komentar";
            let option3 = document.createElement("option");
            option3.value = "Oddelek brez delovnega časa";
            option3.text = "Oddelek brez delovnega časa";

            inputElement.appendChild(option1);
            inputElement.appendChild(option2);
            inputElement.appendChild(option3);
            
            let selectVal = editingTd[i].innerText;
            if (selectVal == "/") selectVal ="";
            inputElement.value = selectVal;
            inputElement.onchange = () => {onSpecialSelect(oddelekId)};
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        } 
        // ustvarimo prekliči gumb
        else if (tdID == "removeBtn") {
            let inputElement = document.createElement("button");
            inputElement.innerText = "Potrdi!";
            inputElement.onclick = () => {btn_confirmEdit(oddelekId, smena)};
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        } 
        // ustvarimo potrdi gumb
        else if (tdID == "editBtn") {
            let inputElement = document.createElement("button");
            inputElement.innerText = "Prekliči!";
            inputElement.onclick = () => { btn_cancelEdit(oddelekId) };
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        } 
        // ustvarimo preostale input elemente
        else if (tdID != "") {
            let inputElement = document.createElement("input");
            inputElement.setAttribute("type", tdID);
            inputElement.value = editingTd[i].innerText;
            if (tdID == "number") {
                inputElement.setAttribute("min", "1");
            }
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        }
    }
}

// gumb za preklic urejanja oddelka
function btn_cancelEdit (oddelekId) {
    let tablerow = document.getElementById(oddelekId);
    tablerow.innerHTML = originalTableRow;
    originalTableRow = "";
    openRowId = "";
    onEditError("popoldne", "");
    onEditError("dopoldne", "");
}

// pobriše čase če si izberemo poseben oddelek
function onSpecialSelect (oddelekId,) {
    let tableRow = document.getElementById(oddelekId);
    let posebnostEdit = tableRow.getElementsByTagName("td")[4].getElementsByTagName("select")[0];

    if (posebnostEdit.value != "")
    {
        let prihodEdit = tableRow.getElementsByTagName("td")[1].getElementsByTagName("input")[0];
        let odhodEdit = tableRow.getElementsByTagName("td")[2].getElementsByTagName("input")[0];

        prihodEdit.value = "";
        odhodEdit.value = "";
    }
}

// gumb za potrditev spremenb
function btn_confirmEdit (oddelekId, smena) {
    checkEditValues(oddelekId, smena);
}

// izpis errorja pri urejanju obstoječega oddelka
function onEditError (smena, errorMsg) {
    let errorElement = document.getElementById(smena + "EditError");
    errorElement.innerHTML = errorMsg;
}

// preverimo če so vnesene vrednosti vredu
function checkEditValues (oddelekId, smena) {
    let tableRow = document.getElementById(oddelekId);

    let imeOddEdit = tableRow.getElementsByTagName("td")[0].getElementsByTagName("input")[0];
    let stVrsticEdit = tableRow.getElementsByTagName("td")[3].getElementsByTagName("input")[0];
    let prihodEdit = tableRow.getElementsByTagName("td")[1].getElementsByTagName("input")[0];
    let odhodEdit = tableRow.getElementsByTagName("td")[2].getElementsByTagName("input")[0];
    let posebnostEdit = tableRow.getElementsByTagName("td")[4].getElementsByTagName("select")[0];
    
    if (imeOddEdit.value == ""){
        onEditError(smena, "Prosim vnesite ime oddelka!");
        imeOddEdit.focus();
        return;
    } else if(stVrsticEdit.value == ""){
        onEditError(smena, "Prosim vnesite št. vrstic za ta oddelek!");
        stVrsticEdit.focus();
        return;
    } else if (parseInt(stVrsticEdit.value) < 1)
    {
        onEditError(smena, "Št. vrstic za oddelek mora biti pozitivna vrednost!");
        stVrsticEdit.focus();
        return;
    }

    if (posebnostEdit.value == "") {
        if(prihodEdit.value == ""){
            onEditError(smena, "Prosim vneiste običajni čas prihoda za oddelek!");
            prihodEdit.focus();
            return;
        } else if(odhodEdit.value == ""){
            onEditError(smena, "Prosim vneiste običajni čas odhoda za oddelek!");
            odhodEdit.focus();
            return;
        }

        let prihodDate = getDateFromTimeString(prihodEdit.value);
        let odhodDate = getDateFromTimeString(odhodEdit.value);
        if (prihodDate >= odhodDate)
        {
            onEditError(smena, "Čas prihoda za oddelek mora biti manjši od časa odhoda za oddelek!");
            prihodEdit.focus();
            return;
        }
    } else {
        prihodEdit.value = "";
        odhodEdit.value = "";
    }
    
    onEditError(smena, "");

    wholeTable = document.getElementById(smena + "TabelBody");
    wholeTable.innerHTML = "<tr><td>Posodabljam</td></tr>";

    posodobiSpremenjenOddelekFirebase (oddelekId, smena, imeOddEdit, stVrsticEdit, 
        prihodEdit, odhodEdit, posebnostEdit);
}

// shranimo spremembe v firebase in posodobimo tabelo
function posodobiSpremenjenOddelekFirebase (oddelekId, smena, imeOddEdit, stVrsticEdit, 
    prihodEdit, odhodEdit, posebnostEdit) {
    
    firebaseRef = firebase.database().ref().child("users/" + userUID + "/oddelki/" + smena + "/" + oddelekId);
    
    let oddelek = {
        imeOddelka: imeOddEdit.value,
        stVrsticOddelka: stVrsticEdit.value,
        prihodNaOddelek: prihodEdit.value,
        odhodIzOddelka: odhodEdit.value,
        specialOddelek: posebnostEdit.value
    };

    firebaseRef.set(oddelek).then ((r) => {
        originalTableRow = "";
        openRowId = "";
        updateTable(smena);
    });
}

// počaka da se firebase vspostavi in nato shrani user id
var checkForFirebaseConn = setInterval(() => {

    var userInst = firebase.auth().currentUser;

    if(userInst) {
        userUID = userInst.uid;
        updateTable("popoldne");
        updateTable("dopoldne");
        clearInterval(checkForFirebaseConn);
    }
}, 300);