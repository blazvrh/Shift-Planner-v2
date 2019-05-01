
// some varibles
const inputFields_oddelki = getInputFields();
const btn_dodajOddelek = document.getElementById("btn_dodajOddelek");

// poišče polja za vnos
function getInputFields () {
    objInpFields = {};
    objInpFields.smenaOddelka = document.getElementById("smenaOddelka");
    objInpFields.imeOddelka = document.getElementById("imeOddelka");
    objInpFields.stVrsticOddelka = document.getElementById("stVrsticOddelka");
    objInpFields.prihodNaOddelek = document.getElementById("prihodNaOddelek");
    objInpFields.odhodIzOddelka = document.getElementById("odhodIzOddelka");
    objInpFields.specialOddelek = document.getElementById("specialOddelek");
    objInpFields.oddelkiErrorMsg = document.getElementById("oddelekInputError");
    return objInpFields;
}

// gumb za dodajanje oddlek
function btnDodajOddelek ()
{
    btn_dodajOddelek.style.display = "none";
    
    if (mainInputValidation()) {
        // pobrišemo error; gumba še ne prikažemo
        onInputErrorOddelki("", false);
    
        submitForm_oddelekAdd();
    }
}

// izpiše error za main input
function onInputErrorOddelki(msg, showBtn) {
    inputFields_oddelki.oddelkiErrorMsg.innerHTML = msg;
    if (showBtn) {
        btn_dodajOddelek.style.display = "initial";
    }
}

// izpiše error za table
function onTableErrorOddelki(msg) {
    let tableErrorMsg = document.getElementById("tableErrorMsg");
    tableErrorMsg.innerHTML = msg;
    
    if (msg != "") {
        window.location.href = "#tableErrorMsg";
    }
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
    inputFields_oddelki.smenaOddelka.value = "";
    inputFields_oddelki.imeOddelka.value = "";
    inputFields_oddelki.stVrsticOddelka.value = "";
    inputFields_oddelki.prihodNaOddelek.value = "";
    inputFields_oddelki.odhodIzOddelka.value = "";
    inputFields_oddelki.specialOddelek.value = "";
    inputFields_oddelki.oddelkiErrorMsg.value = "";
    
    btn_dodajOddelek.style.display = "initial";
}

// pojavno okno pred izbrisom
function removeOddelekFromDb (itemKey) {
    let oddName = document.getElementById(itemKey).getElementsByTagName("td")[0].innerText;

    if (window.confirm ("Ali ste prepričani da želite odstraniti oddelek \"" + oddName + "\"")) {
        submitForm_oddelekRemove(itemKey)
    }
}


/// urejanje obstoječih oddelkov
// shranimo table row, da se ponastavi če prekičemo
var openRowId = "";
var originalTableRow = "";

// odpre urejanje oddelka
function btn_odpriUrediOddelek (oddelekId) {
    // če imamo eno urejanje že odprto in izberemo drugo, zapremo prvo
    if (originalTableRow != "") {
        let openRow = document.getElementById(openRowId);
        openRow.innerHTML = originalTableRow;
        onTableErrorOddelki("");
    }
    
    openRowId = oddelekId;

    createEditRow_oddelki(oddelekId);
}

// gumb za preklic urejanja oddelka
function btn_cancelEdit (oddelekId) {
    let tablerow = document.getElementById(oddelekId);
    tablerow.innerHTML = originalTableRow;
    originalTableRow = "";
    openRowId = "";
    onTableErrorOddelki("");
}

// pobriše čase če si izberemo poseben oddelek
function onSpecialSelect (oddelekId) {
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
// pobriše posebnost če vpišemo čas
function onTimeEnterEdit (oddelekId, val) {
    if (val != "") {
        let tableRow = document.getElementById(oddelekId);
        let posebnostEdit = tableRow.getElementsByTagName("td")[4].getElementsByTagName("select")[0];
        posebnostEdit.value = "";
    }
}


// gumb za potrditev spremenb
function btn_confirmEdit (oddelekId) {
    if (checkEditValues(oddelekId)) {
        onTableErrorOddelki("");

        submitForm_oddelekUpdate(edit_inputFields_oddelki);
    }
}