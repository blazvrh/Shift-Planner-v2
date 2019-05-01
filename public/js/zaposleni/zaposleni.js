
// vsi glavni input fieldi
var documentObjects_zaposleni = get_documentObjects_zaposleni();

get_neccesseryData();

// pridobi potrebne podatke iz databaze
async function get_neccesseryData () {
    await submitForm_oddelekGet();

    documentObjects_zaposleni.loadingData.style.display = "none";
    documentObjects_zaposleni.mainDiv.style.display = "initial";
}


// ipiše error za vnos vrednosti
function onInputErrorZaposleni (msg, showBtn) {
    documentObjects_zaposleni.zaposleniInputError.innerText = msg;
    if (showBtn) {
        documentObjects_zaposleni.style.display = "initial";
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
        prikazanoIme = ime.substring(0,11)
    }
    if (priimek.length > 0) {
        prikazanoIme += " " + priimek.substring(0,1) + ".";
    }
    
    inp_prikazanoImeZaposlenega.value = prikazanoIme;
}






// gumb za dodajanje zaposlenega
function btn_dodajZaposlenoOsebo () {
    btn_dodajZaposlenega.style.display = "none";
    checkInputData();
}







// var inp_imeZaposlenega = document.getElementById("inp_imeZaposlenega");
// var inp_priimekZaposlenega = document.getElementById("inp_priimekZaposlenega");
// var inp_prikazanoImeZaposlenega = document.getElementById("inp_prikazanoImeZaposlenega");

// var inp_maxUrDan = document.getElementById("inp_maxUrDan");
// var inp_maxUrTeden = document.getElementById("inp_maxUrTeden");
// var inp_maxNedelij = document.getElementById("inp_maxNedelij");
// var inp_maxPraznikov = document.getElementById("inp_maxPraznikov");

// var chBox_student = document.getElementById("chBox_student");
// var chBox_studentMlajsi = document.getElementById("chBox_studentMlajsi");

// var zaposleni_keyNameMatch;





// preveri če so input podatki pravilno vneseni
function checkInputData () {
    let maxUrNaDanInt = parseInt(inp_maxUrDan.value);
    let maxUrNaTedenInt = parseInt(inp_maxUrTeden.value);
    let maxNedelij = parseInt(inp_maxNedelij.value);
    let maxPraznikov = parseInt(inp_maxPraznikov.value);

    if (inp_imeZaposlenega.value == "") {
        onInputErrorZaposleni("Prosim vnesite ime zaposlenega!", true);
        inp_imeZaposlenega.focus();
        return;
    }
    else if (inp_priimekZaposlenega.value == "") {
        onInputErrorZaposleni("Prosim vnesite priimek zaposlenega!", true);
        inp_priimekZaposlenega.focus();
        return;
    }
    else if (inp_prikazanoImeZaposlenega.value == "") {
        onInputErrorZaposleni("Prosim vnesite prikazano ime zaposlenega!", true);
        inp_prikazanoImeZaposlenega.focus();
        return;
    }
    else if (zaposleni_keyNameMatch [inp_prikazanoImeZaposlenega.value]) {
        onInputErrorZaposleni("To prikazano ime je že uporabljeno!\nProsim izberite drugačno ime.", true);
        inp_prikazanoImeZaposlenega.focus();
        return;
    }
    else if (inp_maxUrDan.value == "" || maxUrNaDanInt < 1 || maxUrNaDanInt > 24 || maxUrNaDanInt == NaN) {
        onInputErrorZaposleni("Prosim vnesite največje dovoljeno št. oddelanih ur na dan za zaposlenega!\n" + 
            "Vrednost števila mora biti med 1 in 24!", true);
        inp_maxUrDan.focus();
        return;
    }
    else if (inp_maxUrTeden.value == "" || maxUrNaTedenInt < 1 || maxUrNaTedenInt > 168 || maxUrNaTedenInt == NaN) {
        onInputErrorZaposleni("Prosim vnesite največje dovoljeno št. oddelanih ur na teden za zaposlenega! \n" + 
            "Vrednost števila mora biti med 1 in 168!", true);
        inp_maxUrTeden.focus();
        return;
    }
    else if (inp_maxNedelij.value == "" || maxNedelij < 0 || maxNedelij == NaN) {
        onInputErrorZaposleni("Prosim vnesite največje št. dovoljenih oddelanih nedelij na leto za zaposlenega! \n" +
            "Število ne sme imeti negativne vrednosti!", true);
        inp_maxNedelij.focus();
        return;
    }
    else if (inp_maxPraznikov.value == "" || maxPraznikov < 0 || maxPraznikov == NaN) {
        onInputErrorZaposleni("Prosim vnesite največje št. dovoljenih oddelanih praznikov na leto za zaposlenega! \n" +
        "Število ne sme imeti negativne vrednosti!", true);
        inp_maxPraznikov.focus();
        return;
    }
    
    onInputErrorZaposleni("", false);
    addZaposlenegaVFirebase();
}

function addZaposlenegaVFirebase () {
    // če ni UserId potem je nekaj narobe
    if (userUID == null) {
        onInputErrorZaposleni("Ni vspostavljene povezave s strežnikom!s\n" +
            "Preverite internetno povezavo in poiskusite znova.", true);
        return;
    }
    var firebaseRef = firebase.database().ref().child("users").child(userUID).child("zaposleni");

    var zaposleniKey = firebaseRef.push().key;

    let usposobljenost = ustvariUsposobljenostObject();

    let oseba = {
        imeZaposlenega: inp_imeZaposlenega.value,
        priimekZaposlenega: inp_priimekZaposlenega.value,
        priakzanoIme: inp_prikazanoImeZaposlenega.value,
        maxUrDan: inp_maxUrDan.value,
        maxUrTeden: inp_maxUrTeden.value,
        maxNedelij: inp_maxNedelij.value,
        maxPraznikov: inp_maxPraznikov.value,
        student: chBox_student.checked,
        studentMlajsi: chBox_studentMlajsi.checked,
        usposobljenost: usposobljenost
    };

    firebaseRef.child(zaposleniKey).set(oseba).then((r) => {
        // updateTable(smenaOddelka.value);
        
        clearInputValuesZaposleni();
        btn_dodajZaposlenega.style.display = "initial";
    });
}

// ustvari object za usposobljenost
function ustvariUsposobljenostObject () {
    let usposobljenostChkBoxes = document.getElementById("seznamUsposobljenosti").getElementsByTagName("label");
    
    var usposobljenostObj = {};

    for (let i = 0; i < usposobljenostChkBoxes.length; i++) {
        imeodd = usposobljenostChkBoxes[i].innerText;

        let chkBox = usposobljenostChkBoxes[i].getElementsByTagName("input")[0];
        val = chkBox.checked;
        
        usposobljenostObj[imeodd] = val;
    }
    
    return usposobljenostObj;
}

// počisti vsa input polja 
function clearInputValuesZaposleni() {
    inp_imeZaposlenega.value = "";
    inp_priimekZaposlenega.value = "";
    inp_prikazanoImeZaposlenega.value = "";
    inp_maxUrDan.value = "";
    inp_maxUrTeden.value = "";
    inp_maxNedelij.value = "";
    inp_maxPraznikov.value = "";
    chBox_student.checked = false;
    chBox_studentMlajsi.checked = false;

    let usposobljenostChkBoxes = document.getElementById("seznamUsposobljenosti").getElementsByTagName("label");
    for (let i = 0; i < usposobljenostChkBoxes.length; i++) {
        chBox = usposobljenostChkBoxes[i].getElementsByTagName("input")[0];
        chBox.checked = false;
    }
}