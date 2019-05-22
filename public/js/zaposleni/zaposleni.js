
// vsi glavni input fieldi
var documentObjects_zaposleni = get_documentObjects_zaposleni();
// vsa prikazana imena obstoječih zaposlenih
var prikazanaImenaVsa = [];

window.addEventListener('load', () => {
    if (userData) {
        get_neccesseryData();
    }
});

// pridobi potrebne podatke iz databaze
async function get_neccesseryData () {
    
    submitForm_oddelekGet();

    // če so podatki pridobljeni (ready state = 4) prikaži spletno stran
    var check_zaposleniLoaded = setInterval(() => {
        if (xhrGetZaposlene.readyState == 4) {
            documentObjects_zaposleni.loadingData.style.display = "none";
            documentObjects_zaposleni.mainDiv.style.display = "initial";
            clearInterval(check_zaposleniLoaded);
        }
    }, 300);
}

// ipiše error za vnos vrednosti
function onInputErrorZaposleni (msg, showBtn) {
    documentObjects_zaposleni.zaposleniInputError.innerText = msg;
    if (showBtn == null) showBtn = true;
    if (showBtn) {
        documentObjects_zaposleni.btn_dodajZaposlenega.style.display = "initial";
    }
}

// izpiše error za tabelo zaposlenih
function onError_seznamZaposlenih (msg) {
    let seznamZaposlenihErrorMsg = document.getElementById("seznamZaposlenihErrorMsg");
    seznamZaposlenihErrorMsg.innerText = msg;

    if (msg != "") {
        window.location.href = "#seznamZaposlenihErrorMsg";
    }
}

// poišče vsa glavna input polja
function get_documentObjects_zaposleni () {
    let docObj = {};

    docObj.inp_imeZaposlenega = document.getElementById("inp_imeZaposlenega");
    docObj.inp_priimekZaposlenega = document.getElementById("inp_priimekZaposlenega");
    docObj.inp_prikazanoImeZaposlenega = document.getElementById("inp_prikazanoImeZaposlenega");
    
    docObj.inp_maxUrDan = document.getElementById("inp_maxUrDan");
    docObj.inp_maxUrTeden = document.getElementById("inp_maxUrTeden");
    docObj.inp_maxNedelij = document.getElementById("inp_maxNedelij");
    docObj.inp_maxPraznikov = document.getElementById("inp_maxPraznikov");
    
    docObj.chBox_student = document.getElementById("chBox_student");
    docObj.chBox_studentMlajsi = document.getElementById("chBox_studentMlajsi");

    docObj.zaposleniInputError = document.getElementById("zaposleniInputError");

    docObj.btn_dodajZaposlenega = document.getElementById("btn_dodajZaposlenega");

    docObj.loadingData = document.getElementById("loadingData");
    docObj.mainDiv = document.getElementById("mainDiv");

    return docObj;
}

// avtomatsko izpolni prikazano ime ko vnašamo Ime in priimek
function onChange_autoFillPrikazanoIme () {
    let ime = inp_imeZaposlenega.value;
    let priimek = inp_priimekZaposlenega.value;

    let prikazanoIme = "";
    if (ime.length < 11) {
        prikazanoIme = ime;
    } else {
        prikazanoIme = ime.substring(0,10)
    }
    if (priimek.length > 0) {
        prikazanoIme += " " + priimek.substring(0,1) + ".";
    }
    
    inp_prikazanoImeZaposlenega.value = prikazanoIme;
}

// počisti vsa main input polja 
function clearInputValuesZaposleni() {
    for (var key in documentObjects_zaposleni) {
        docElement = documentObjects_zaposleni[key];
        if (docElement.tagName.toLowerCase() == "input" && docElement.type.toLowerCase() != "checkbox") {
            docElement.value = "";
        }
        else if (docElement.tagName.toLowerCase() == "input" && docElement.type.toLowerCase() == "checkbox") {
            docElement.checked = false;
        }
    }
    let usposobljenostChkBoxes = document.getElementById("seznamUsposobljenosti").getElementsByTagName("label");
    for (let i = 0; i < usposobljenostChkBoxes.length; i++) {
        chBox = usposobljenostChkBoxes[i].getElementsByTagName("input")[0];
        chBox.checked = false;
    }
}


// gumb za dodajanje zaposlenega
var check_zaposleniDataLoaded = 0;   // da omejimo št. send requestov ki čakajo na ENEGA!
function btn_dodajZaposlenoOsebo () {
    documentObjects_zaposleni.btn_dodajZaposlenega.style.display = "none";
    
    // interval ki počaka da so podatki o obstoječih zaposlenih pridobljeni iz databaze
    // če je check_zaposleniDataLoded = 0, potem interval ne teče - drugače interval teče in nočemo še enega
    if (checkInputData() && check_zaposleniDataLoaded == 0) {
        check_zaposleniDataLoaded = setInterval(() => {
            // če so podatki pridobljeni (ready state = 4) nadaljuj
            if (xhrGetZaposlene.readyState == 4) {
                // oddalj formo, počisti vrednosti, prikaži gumb in ustavi interval
                submitForm_zaposleniAdd();
                clearInputValuesZaposleni();
                onInputErrorZaposleni("");
                clearInterval(check_zaposleniDataLoaded);
                check_zaposleniDataLoaded = 0;
            }
        }, 300);
    }
}

// gumb za odstranjevanje zaposlenega
function btn_removeZaposleniFromDb (zapId) {
    let zapTdArray = document.querySelector('[zapid="' + zapId + '"]').getElementsByTagName("td");
    
    let zapName = zapTdArray[1].innerText + " " + zapTdArray[2].innerText + ' - "' + zapTdArray[0].innerText + '"';

    if (window.confirm ("Ali ste prepričani da želite odstraniti zaposlenega: " + zapName + "?")) {
        submitForm_zaposleniRemove(zapId);
    }   
}


/// urejanje obstoječih zaposlenih
// shranimo table row, da se ponastavi če prekičemo
var openRowId = "";
var originalTableRow = "";
var currentPrikazanoIme = "";

// gumb - odpre urejanje zaposlenega
function btn_odpriUrediZaposlenega(zapId) {
    // če imamo eno urejanje že odprto in izberemo drugo, zapremo prvo
    if (originalTableRow != "") {
        let openRow = document.querySelector('[zapid="' + openRowId + '"]');
        openRow.innerHTML = originalTableRow;
        onError_seznamZaposlenih("");
    }
    
    openRowId = zapId;
    createEditRow_zaposleni(zapId);
}

// gumb za preklic urejanja zaposlenega
function btn_cancelEdit_zaposleni (zapId) {
    let tablerow = document.querySelector('[zapid="' + zapId + '"]');
    tablerow.innerHTML = originalTableRow;
    originalTableRow = "";
    openRowId = "";
    currentPrikazanoIme = "";
    onError_seznamZaposlenih("");
}

// potrdi spremembo zaposlenega
function btn_confirmEdit_zaposleni(zapId) {
    // interval ki počaka da so podatki o obstoječih zaposlenih pridobljeni iz databaze
    // če je check_zaposleniDataLoded = 0, potem interval ne teče - drugače interval teče in nočemo še enega
    if (check_EditValues_zaposleni(zapId) && check_zaposleniDataLoaded == 0) {
        check_zaposleniDataLoaded = setInterval(() => {
            // če so podatki pridobljeni (ready state = 4) nadaljuj
            if (xhrGetZaposlene.readyState == 4) {
                // zbrišemo error, oddamo formo
                onError_seznamZaposlenih("");
                submitForm_zaposleniUpdate(edit_inputFields_zaposleni);
                openRowId = "";
                originalTableRow = "";
                currentPrikazanoIme = "";
                clearInterval(check_zaposleniDataLoaded);
                check_zaposleniDataLoaded = 0;
            }
        }, 300);
    }
}