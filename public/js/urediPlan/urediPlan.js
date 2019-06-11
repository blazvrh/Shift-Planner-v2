
var data = { };
var allErrors = { warnings:[], errors:[] }
var allDataCellElements;
var buttonElements = { };

var dnevniPocitek = 11; // potreben minimalni dnevni počitek v urah

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

    buttonElements = {
        btn_showWeek: document.getElementById("btn_showWeek"),
        saveCurrPlan: document.getElementById("saveCurrPlan"),
        checkCurrPlan: document.getElementById("checkCurrPlan"),
        clearAllInputs: document.getElementById("clearAllInputs")
    };

    // lisener za prikaži teden btn
    buttonElements.btn_showWeek.onclick = function() { btn_createCurrTable(); }
    // lisener za spremembo tedna btn (-1)
    document.getElementById("week_reduce").onclick = function() { btn_changeWeekByOne(-1); }
    // lisener za spremembo tedna btn (+1)
    document.getElementById("week_increse").onclick = function() { btn_changeWeekByOne(1); }
    // lisener za save btn
    buttonElements.saveCurrPlan.onclick = function() { btn_save_currPlan(); }
    // lisener za check btn
    buttonElements.checkCurrPlan.onclick = function() { btn_check_currPlan(); }
    // lisener za clear all inputs
    buttonElements.clearAllInputs.onclick = function() { btn_clear_WeekInputs(); }

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
    buttonElements.saveCurrPlan.disabled = true;
    
    let weekNum = currDateData.workingWeekNumber;
    let year = currDateData.workingMondayDate.getFullYear();
    let mondayDate = convertDateToString(currDateData.workingMondayDate);

    let tableData = get_currPlan_data_workerOriented();

    let sundayData = get_sundayData(tableData);

    submitForm_save_trenuenPlan(weekNum, year, mondayDate, tableData, sundayData);
}

// počisti vse inpute v tem tednu
function btn_clear_WeekInputs () {
    buttonElements.clearAllInputs.disabled = true;
    
    if (!confirm("Ali ste prepričan da želite počisiti celoten tedenski plan?")) {
        buttonElements.clearAllInputs.disabled = false;
        return;
    }

    for (let i = 0; i < allDataCellElements.length; i++) {
        let inputs = allDataCellElements[i].querySelectorAll("input");
        
        for (let j = 0; j < inputs.length; j++) {
            inputs[j].value = "";
        }
    }
    clearWarnErrorIndexes();
    
    buttonElements.clearAllInputs.disabled = false;
}

// preveri trenuten plan ....
function btn_check_currPlan () {
    buttonElements.checkCurrPlan.disabled = true;

    allErrors = { warnings:[], errors:[] }
    let tooltips = document.getElementsByClassName("tooltipText");
    
    // postavimo vse tooltipe na prazno
    for (let i = 0; i < tooltips.length; i++) {
        tooltips[i].setAttribute("isEmpty", "true");
        tooltips[i].innerHTML = "";
    }
    
    // prebermo podatke iz tabele 
    let rawWeekData = get_currPlan_data_workerOriented()
    // pretvorimo podatke v primeren format
    let currWeekData = get_currPlan_Worker_dayOriented(rawWeekData);

    // seštejemo in prikažemo seštevek ur v tednu
    sumAndShow_sestevekUr(currWeekData);
    // prikažemo vse manjkajoče osebe v planu
    create_missingPersonsTable(get_missingPresonData(currWeekData));

    // warning check
    preveri_zaposlen_obstaja(currWeekData);
    preveri_zaposlen_usposobljenost(currWeekData);
    preveri_prejsnoNedeljo(data.prevWeekData, currWeekData);
    preveri_tedenskiPocitek(currWeekData, data.prevWeekData);
    preveri_tedenskiPocitek_SobotaPonedeljek(data.prevWeekData, currWeekData);
    // tole pravilo mislim da je brez smisla
    //preveri_prostDan_poDelovniNedelji(data.prevWeekData, currWeekData);

    // error check
    preveri_cas_prekrivanje(currWeekData);
    preveri_maxCase(currWeekData);
    preveri_dnevniPocitek(data.prevWeekData, currWeekData);
    preveri_dvoTedenskiPocitek(data.prevWeekData, currWeekData);
    preveri_prepovedDeljenegaDela(currWeekData);
    preveri_stNedelijLetno(currWeekData);
    
    // prikažemo vse napake
    displayErrors(tooltips);
    
    buttonElements.checkCurrPlan.disabled = false;
}


function displayErrors (tooltips) {
    // pobriše indexe errorjev in warningov
    clearWarnErrorIndexes();

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
            
            // prikaže index za error
            let errIndex = tooltips[i].parentNode.parentNode.querySelectorAll("div[indextype='error']")[0];
            errIndex.innerHTML = "<p>" + posErrors.length.toString() + "</p>";
            errIndex.className = "show";
        }

        // preverimo če je warning za ta tooltip
        if (fullPos in allErrors.warnings) {
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

            // prikaže index za error
            let warnIndex = tooltips[i].parentNode.parentNode.querySelectorAll("div[indextype='warning']")[0];
            warnIndex.innerHTML = "<p>" + posWarnings.length.toString() + "</p>";
            warnIndex.className = "show";
        }
    }
}

// pobriše indexe errorjev in warningov
function clearWarnErrorIndexes () {
    allIndexes = document.querySelectorAll("div[indextype]");
    for (let i = 0; i < allIndexes.length; i++) {
        allIndexes[i].className = "hide";
    }
}



// // get key of object by known value
// function getKeyByValue(object, value) {
//     return Object.keys(object).find(key => object[key] === value);
// }

