
// preveri če so vsa potrebna polja za main input polna in pravih vrednosti
function mainInputValidation () {
    
    // preveri prisotnost vnosa imena
    if (inputFields_oddelki.imeOddelka.value == ""){
        onInputErrorOddelki("Prosim vnesite ime oddelka!", true);
        inputFields_oddelki.imeOddelka.focus();
        return false;
    }
    // preveri prisotnost vnosa smene
    else if(inputFields_oddelki.smenaOddelka.value == "") {
        onInputErrorOddelki("Prosim izberite čas izmene!", true);
        inputFields_oddelki.smenaOddelka.focus();
        return false;
    }
    // preveri prisotnost vnosa št- vrstic
    else if(inputFields_oddelki.stVrsticOddelka.value == ""){
        onInputErrorOddelki("Prosim vnesite št. vrstic za ta oddelek!", true);
        inputFields_oddelki.stVrsticOddelka.focus();
        return false;
    }
    // preveri če je št. vrstic večje od 0
    else if (parseInt(inputFields_oddelki.stVrsticOddelka.value) < 1)
    {
        onInputErrorOddelki("Št. vrstic za oddelek mora biti pozitivna vrednost!", true);
        inputFields_oddelki.stVrsticOddelka.focus();
        return false;
    }

    if (inputFields_oddelki.specialOddelek.value == "") {
        // preveri prisotnost vnosa prihoda in odhoda
        if(inputFields_oddelki.prihodNaOddelek.value == ""){
            onInputErrorOddelki("Prosim vneiste običajni čas prihoda za oddelek!", true);
            inputFields_oddelki.prihodNaOddelek.focus();
            return false;
        }
        else if(inputFields_oddelki.odhodIzOddelka.value == ""){
            onInputErrorOddelki("Prosim vneiste običajni čas odhoda za oddelek!", true);
            inputFields_oddelki.odhodIzOddelka.focus();
            return false;
        }

        // preveri če je prihod večji od odhoda
        const prihodDate = getDateFromTimeString(inputFields_oddelki.prihodNaOddelek.value);
        const odhodDate = getDateFromTimeString(inputFields_oddelki.odhodIzOddelka.value);
        if (prihodDate >= odhodDate)
        {
            onInputErrorOddelki("Čas prihoda za oddelek mora biti manjši od časa odhoda za oddelek!", true);
            inputFields_oddelki.prihodNaOddelek.focus();
            return false;
        }
    }
    // če je special oddelek potem pobriši prihod in odhod
    else {
        inputFields_oddelki.prihodNaOddelek.value = "";
        inputFields_oddelki.odhodIzOddelka.value = "";
    }

    return true;
}


var edit_inputFields_oddelki = {};

// preverimo če so vnesene vrednosti vredu
function checkEditValues (oddelekId) {
    let tableRow = document.getElementById(oddelekId);
    
    edit_inputFields_oddelki.oddID = oddelekId;
    edit_inputFields_oddelki.imeOddEdit = tableRow.getElementsByTagName("td")[0].getElementsByTagName("input")[0];
    edit_inputFields_oddelki.stVrsticEdit = tableRow.getElementsByTagName("td")[3].getElementsByTagName("input")[0];
    edit_inputFields_oddelki.prihodEdit = tableRow.getElementsByTagName("td")[1].getElementsByTagName("input")[0];
    edit_inputFields_oddelki.odhodEdit = tableRow.getElementsByTagName("td")[2].getElementsByTagName("input")[0];
    edit_inputFields_oddelki.posebnostEdit = tableRow.getElementsByTagName("td")[4].getElementsByTagName("select")[0];
    
    if (edit_inputFields_oddelki.imeOddEdit.value == ""){
        onTableErrorOddelki("Prosim vnesite ime oddelka!");
        edit_inputFields_oddelki.imeOddEdit.focus();
        return false;
    } else if(edit_inputFields_oddelki.stVrsticEdit.value == ""){
        onTableErrorOddelki("Prosim vnesite št. vrstic za ta oddelek!");
        edit_inputFields_oddelki.stVrsticEdit.focus();
        return false;
    } else if (parseInt(edit_inputFields_oddelki.stVrsticEdit.value) < 1)
    {
        onTableErrorOddelki("Št. vrstic za oddelek mora biti pozitivna vrednost!");
        edit_inputFields_oddelki.stVrsticEdit.focus();
        return false;
    }

    if (edit_inputFields_oddelki.posebnostEdit.value == "") {
        if(edit_inputFields_oddelki.prihodEdit.value == ""){
            onTableErrorOddelki("Prosim vneiste običajni čas prihoda za oddelek!");
            edit_inputFields_oddelki.prihodEdit.focus();
            return false;
        } else if(edit_inputFields_oddelki.odhodEdit.value == ""){
            onTableErrorOddelki("Prosim vneiste običajni čas odhoda za oddelek!");
            edit_inputFields_oddelki.odhodEdit.focus();
            return false;
        }

        let prihodDate = getDateFromTimeString(edit_inputFields_oddelki.prihodEdit.value);
        let odhodDate = getDateFromTimeString(edit_inputFields_oddelki.odhodEdit.value);
        if (prihodDate >= odhodDate)
        {
            onTableErrorOddelki("Čas prihoda za oddelek mora biti manjši od časa odhoda za oddelek!");
            edit_inputFields_oddelki.prihodEdit.focus();
            return false;
        }
    } else {
        edit_inputFields_oddelki.prihodEdit.value = "";
        edit_inputFields_oddelki.odhodEdit.value = "";
    }
    
    return true;
}