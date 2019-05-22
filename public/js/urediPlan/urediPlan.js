
var data = { };
var allErrors = { warnings:[], errors:[] }
var allDataCellElements;

// pridobimo podatke ko se stran laoži
window.addEventListener('load', () => {
    if (userData) { 
        submitForm_oddelekGet();
    }
});

function error_onTableShow (msg) {
    document.getElementById("loadWeekError").innerHTML = msg;

    if (msg != "") {
        window.location.href ="#loadWeekError";
        
    }
}

// prikaže spletno stran (izbor tedna)
function showMainPageContent () {
    // ker ni argumenta izbere trenuten teden
    izberiCelotenTeden();

    // lisener za save btn
    document.getElementById("saveCurrPlan").onclick = function() { btn_save_currPlan(); }
    // lisener za check btn
    document.getElementById("checkCurrPlan").onclick = function() { btn_check_currPlan(); }
    
    // prikažemo spletno stran
    document.getElementById("loadingData").style.display = "none";
    document.getElementById("mainPageContent").style.display = "initial";
    
}

// nastavi seznam opcij zaposlenih
function set_options_forZaposlene (zaposleni) {
    let imenaZaposlenih_datalist = document.getElementById("imenaZaposlenih");
    imenaZaposlenih_datalist.innerHTML = "";

    let zaposleniNames = Object.keys(zaposleni);
    zaposleniNames.forEach(element => {
        let singleOption = document.createElement("option");
        singleOption.setAttribute("value", element);
        imenaZaposlenih_datalist.append(singleOption);
    });
}


// shrani trenuten plan ....
function btn_save_currPlan () {
    
    let weekNum = currDateData.workingWeekNumber;
    let year = currDateData.workingMondayDate.getFullYear();
    let mondayDate = convertDateToString(currDateData.workingMondayDate);

    let tableData = get_currPlan_data_workerOriented();
    
    submitForm_save_trenuenPlan(weekNum, year, mondayDate, tableData);
}

// preveri trenuten plan ....
function btn_check_currPlan () {
    allErrors = { warnings:[], errors:[] }
    let tooltips = document.getElementsByClassName("tooltipText");
    
    // postavimo vse tooltipe na prazno
    for (let i = 0; i < tooltips.length; i++) {
        tooltips[i].setAttribute("isEmpty", "true");
        tooltips[i].innerHTML = "";
    }
    
    // prebermo podatke iz tabele (true pomeni da ignorira vse desno od zvezdice)
    let currWeekData = get_currPlan_data_workerOriented(true);

    // warning check
    preveri_zaposlen_obstaja(currWeekData);
    preveri_zaposlen_usposobljenost(currWeekData);


    // error check
    preveri_cas_prekrivanje(currWeekData);
    preveri_cas_tedenskiMax(currWeekData);
    preveri_cas_dnevniMax(currWeekData);
    
    // prikažemo vse napake
    displayErrors(tooltips);
}


function displayErrors (tooltips) {
    // pobrišemo bg color
    clear_backgroundColor();

    // gremo čez vse tooltipe
    for (let i = 0; i < tooltips.length; i++) {
        let fullPos = tooltips[i].getAttribute("fullPosition")

        // preverimo če je error za ta tooltip
        if (fullPos in allErrors.errors) {
            let errorMsgHtml = "<div class = 'errorInTooltip'><span class='tooltipTitle'>Napake:</span>"
            let posErrors = allErrors.errors[fullPos];
            // izpišemo vse warninge za to pozicijo
            for (let keyIndex = 0; keyIndex < posErrors.length; keyIndex++) {
                
                errorMsgHtml += "<p>" + posErrors[keyIndex] + "</p>";
                tooltips[i].setAttribute("isEmpty", "false");   
            }
            errorMsgHtml += "</div>"
            tooltips[i].innerHTML = errorMsgHtml;
            let tdNode = tooltips[i].parentNode.parentNode;
            tdNode.classList.add("toolTipError");
        }

        // preverimo če je warning za ta tooltip
        if (fullPos in allErrors.warnings) {
            // if (tooltips[i].innerHTML != "") {
            //     tooltips[i].innerHTML += "<br><br>"
            // }
            // tooltips[i].innerHTML += "<span class='tooltipTitle'>Opozorila:</span>"
            
            let warningMsgHtml = "<div class = warningInTooltip><span class='tooltipTitle'>Opozorila:</span>"
            let posWarnings = allErrors.warnings[fullPos];
            // izpišemo vse warninge za to pozicijo
            for (let keyIndex = 0; keyIndex < posWarnings.length; keyIndex++) {
                
                // tooltips[i].innerHTML += posWarnings[keyIndex];
                warningMsgHtml += "<p>" + posWarnings[keyIndex] + "</p>";
                tooltips[i].setAttribute("isEmpty", "false");   
            }
            warningMsgHtml += "</div>"
            tooltips[i].innerHTML += warningMsgHtml;

            let tdNode = tooltips[i].parentNode.parentNode;
            tdNode.classList.add("toolTipWarning");
        }
    }
}

// izbriše class ki da bg color
function clear_backgroundColor () {
    for (let i = 0; i < allDataCellElements.length; i++) {
        allDataCellElements[i].classList.remove("toolTipError");
        allDataCellElements[i].classList.remove("toolTipWarning");
    }
}



// // get key of object by known value
// function getKeyByValue(object, value) {
//     return Object.keys(object).find(key => object[key] === value);
// }

