
// preveri če je zvezdica v danem stringu
function checkForZvezdicaInString (stringValue) {
    if (stringValue.match(/[*]/i) == null) {
        return false;
    } else {
        return true;
    }
}

// preveri če so input podatki pravilno vneseni
function checkInputData () {
    let maxUrNaDanInt = parseInt(documentObjects_zaposleni.inp_maxUrDan.value);
    let maxUrNaTedenInt = parseInt(documentObjects_zaposleni.inp_maxUrTeden.value);
    let maxNedelij = parseInt(documentObjects_zaposleni.inp_maxNedelij.value);
    let maxPraznikov = parseInt(documentObjects_zaposleni.inp_maxPraznikov.value);
    
    // odstrani odvečne presledke iz prikazanega imena
    documentObjects_zaposleni.inp_prikazanoImeZaposlenega.value = documentObjects_zaposleni.inp_prikazanoImeZaposlenega.value.trim();
    
    if (documentObjects_zaposleni.inp_imeZaposlenega.value == "") {
        onInputErrorZaposleni("Prosim vnesite ime zaposlenega!");
        documentObjects_zaposleni.inp_imeZaposlenega.focus();
        return false;
    }
    else if (documentObjects_zaposleni.inp_priimekZaposlenega.value == "") {
        onInputErrorZaposleni("Prosim vnesite priimek zaposlenega!");
        documentObjects_zaposleni.inp_priimekZaposlenega.focus();
        return false;
    }
    else if (documentObjects_zaposleni.inp_prikazanoImeZaposlenega.value == "") {
        onInputErrorZaposleni("Prosim vnesite prikazano ime zaposlenega!");
        documentObjects_zaposleni.inp_prikazanoImeZaposlenega.focus();
        return false;
    }
    else if (checkForZvezdicaInString(documentObjects_zaposleni.inp_prikazanoImeZaposlenega.value)) {
        onInputErrorZaposleni("Prikazano ime zaposlenega ne sme vsebovati znaka * (zvezdica)!");
        documentObjects_zaposleni.inp_prikazanoImeZaposlenega.focus();
        return false;
    }
    else if (prikazanaImenaVsa.indexOf((documentObjects_zaposleni.inp_prikazanoImeZaposlenega.value).toLowerCase()) > -1) {
        onInputErrorZaposleni("To prikazano ime je že uporabljeno!\nProsim izberite drugačno ime.");
        documentObjects_zaposleni.inp_prikazanoImeZaposlenega.focus();
        return false;
    }
    else if (documentObjects_zaposleni.inp_maxUrDan.value == "" || maxUrNaDanInt < 1 || maxUrNaDanInt > 24 || maxUrNaDanInt == NaN) {
        onInputErrorZaposleni("Prosim vnesite največje dovoljeno št. oddelanih ur na dan za zaposlenega!\n" + 
            "Vrednost števila mora biti med 1 in 24!");
            documentObjects_zaposleni.inp_maxUrDan.focus();
        return false;
    }
    else if (documentObjects_zaposleni.inp_maxUrTeden.value == "" || maxUrNaTedenInt < 1 || maxUrNaTedenInt > 168 || maxUrNaTedenInt == NaN) {
        onInputErrorZaposleni("Prosim vnesite največje dovoljeno št. oddelanih ur na teden za zaposlenega! \n" + 
            "Vrednost števila mora biti med 1 in 168!");
            documentObjects_zaposleni.inp_maxUrTeden.focus();
        return false;
    }
    else if (documentObjects_zaposleni.inp_maxNedelij.value == "" || maxNedelij < 0 || maxNedelij == NaN) {
        onInputErrorZaposleni("Prosim vnesite največje št. dovoljenih oddelanih nedelij na leto za zaposlenega! \n" +
            "Število ne sme imeti negativne vrednosti!");
            documentObjects_zaposleni.inp_maxNedelij.focus();
        return false;
    }
    else if (documentObjects_zaposleni.inp_maxPraznikov.value == "" || maxPraznikov < 0 || maxPraznikov == NaN) {
        onInputErrorZaposleni("Prosim vnesite največje št. dovoljenih oddelanih praznikov na leto za zaposlenega! \n" +
        "Število ne sme imeti negativne vrednosti!");
        documentObjects_zaposleni.inp_maxPraznikov.focus();
        return false;
    }

    return true;
}

var edit_inputFields_zaposleni = {};
// preveri vnos podatkov za urejanje zaposlenega
function check_EditValues_zaposleni (zapId) {

    let tableRowObj = document.querySelector('[zapid="' + zapId + '"]').getElementsByTagName("td");

    edit_inputFields_zaposleni = create_edit_inputFields_object(zapId, tableRowObj);

    let maxUrDanZap = parseInt(edit_inputFields_zaposleni.maxUrDanZap_edit.value);
    let maxUrTedenZap = parseInt(edit_inputFields_zaposleni.maxUrTedenZap_edit.value);
    let maxNedelijZap = parseInt(edit_inputFields_zaposleni.maxNedelijZap_edit.value);
    let maxPraznikovZap = parseInt(edit_inputFields_zaposleni.maxPraznikovZap_edit.value);
    
    // odstrani odvečne presledke iz prikazanega imena
    edit_inputFields_zaposleni.prikazanoImeZap_edit.value = edit_inputFields_zaposleni.prikazanoImeZap_edit.value.trim();

    if (edit_inputFields_zaposleni.prikazanoImeZap_edit.value == "") {
        onError_seznamZaposlenih("Prosim vnesite prikazano ime zaposlenega!");
        edit_inputFields_zaposleni.prikazanoImeZap_edit.focus();
        return false;
    }
    else if (checkForZvezdicaInString(edit_inputFields_zaposleni.prikazanoImeZap_edit.value)) {
        onError_seznamZaposlenih("Prikazano ime zaposlenega ne sme vsebovati znaka * (zvezdica)!");
        edit_inputFields_zaposleni.prikazanoImeZap_edit.focus();
        return false;
    }
    else if (edit_inputFields_zaposleni.prikazanoImeZap_edit.value.toLowerCase() != currentPrikazanoIme.toLowerCase() &&
        prikazanaImenaVsa.indexOf((edit_inputFields_zaposleni.prikazanoImeZap_edit.value).toLowerCase()) > -1) {
        
        onError_seznamZaposlenih("To prikazano ime je že uporabljeno!\nProsim izberite drugačno ime.");
        edit_inputFields_zaposleni.prikazanoImeZap_edit.focus();
        return false;
    }
    else if (edit_inputFields_zaposleni.imeZap_edit.value == "") {
        onError_seznamZaposlenih("Prosim vnesite ime zaposlenega!");
        edit_inputFields_zaposleni.imeZap_edit.focus();
        return false;
    }
    else if (edit_inputFields_zaposleni.priimekZap_edit.value == "") {
        onError_seznamZaposlenih("Prosim vnesite priimek zaposlenega!");
        edit_inputFields_zaposleni.priimekZap_edit.focus();
        return false;
    }
    else if (edit_inputFields_zaposleni.maxUrDanZap_edit.value == "" || maxUrDanZap < 1 || maxUrDanZap > 24 || maxUrDanZap == NaN) {
        onError_seznamZaposlenih("Prosim vnesite največje dovoljeno št. oddelanih ur na dan za zaposlenega!\n" + 
            "Vrednost števila mora biti med 1 in 24!");
            edit_inputFields_zaposleni.maxUrDanZap_edit.focus();
        return false;
    }
    else if (edit_inputFields_zaposleni.maxUrTedenZap_edit.value == "" || maxUrTedenZap < 1 || maxUrTedenZap > 168 || maxUrTedenZap == NaN) {
        onError_seznamZaposlenih("Prosim vnesite največje dovoljeno št. oddelanih ur na teden za zaposlenega! \n" + 
            "Vrednost števila mora biti med 1 in 168!");
            edit_inputFields_zaposleni.maxUrTedenZap_edit.focus();
        return false;
    }
    else if (edit_inputFields_zaposleni.maxNedelijZap_edit.value == "" || maxNedelijZap < 0 || maxNedelijZap == NaN) {
        onError_seznamZaposlenih("Prosim vnesite največje št. dovoljenih oddelanih nedelij na leto za zaposlenega! \n" +
            "Število ne sme imeti negativne vrednosti!");
            edit_inputFields_zaposleni.maxNedelijZap_edit.focus();
        return false;
    }
    else if (edit_inputFields_zaposleni.maxPraznikovZap_edit.value == "" || maxPraznikovZap < 0 || maxPraznikovZap == NaN) {
        onError_seznamZaposlenih("Prosim vnesite največje št. dovoljenih oddelanih praznikov na leto za zaposlenega! \n" +
        "Število ne sme imeti negativne vrednosti!");
        edit_inputFields_zaposleni.maxPraznikovZap_edit.focus();
        return false;
    }
    
    return true;
}

// ustvari objekt z vsemi input/select elementi
function create_edit_inputFields_object (zapId, tableRowObj) {
    inpObj = { };

    inpObj.zapID = zapId;
    inpObj.prikazanoImeZap_edit = tableRowObj[0].getElementsByTagName("input")[0];
    inpObj.imeZap_edit = tableRowObj[1].getElementsByTagName("input")[0];
    inpObj.priimekZap_edit = tableRowObj[2].getElementsByTagName("input")[0];
    inpObj.maxUrDanZap_edit = tableRowObj[3].getElementsByTagName("input")[0];
    inpObj.maxUrTedenZap_edit = tableRowObj[4].getElementsByTagName("input")[0];
    inpObj.maxNedelijZap_edit = tableRowObj[5].getElementsByTagName("input")[0];
    inpObj.maxPraznikovZap_edit = tableRowObj[6].getElementsByTagName("input")[0];
    inpObj.student_edit = tableRowObj[7].getElementsByTagName("select")[0];
    inpObj.studentMlajsi_edit = tableRowObj[8].getElementsByTagName("select")[0];
    
    let oddelkiZaZaposl = tableRowObj[9].getElementsByTagName("label");
    let usposobljenost = { };

    for (let i = 0; i < oddelkiZaZaposl.length; i++) {
        usposobljenost[oddelkiZaZaposl[i].innerText.toLowerCase()] = JSON.parse(oddelkiZaZaposl[i].getAttribute("value"));
    }
    inpObj.usposobljenost = usposobljenost;

    return inpObj;
}