
// ustvari day orientiran objekt podatkov iz worker oriented; rabim za lažji prikaz shranjenih podatkov tedna
function get_currPlan_data_dayOriented (workerOrientedData) {
    var dayOrientedData = { 1: { day: "Ponedeljek" }, 
        2: { day: "Torek" }, 
        3: { day: "Sreda" }, 
        4: { day: "Četrtek" }, 
        5: { day: "Petek" }, 
        6: { day: "Sobota" }, 
        7: { day: "Nedelja" } 
    };
    
    var dataKeys = Object.keys(workerOrientedData);
   
    dataKeys.forEach(key => {        
        workerData = workerOrientedData[key];
        workerData.forEach(element => {
            var day = element.dayIndex;
            var startTime = element.startTime;
            var endTime = element.endTime;
            var oddId = element.oddelekId;
            
            if (!dayOrientedData[day][oddId]) {
                dayOrientedData[day][oddId] = [];
            }
            var cellData = { nameVal: key, oddName: element.oddelekName };
            
            if (startTime != null) {
                cellData.startTime = startTime;
            }
            if (endTime != null) {
                cellData.endTime = endTime;
            }

            dayOrientedData[day][oddId].push(cellData);
        });
    });
    
    return dayOrientedData;
}

// worker oriented data of the week
function get_currPlan_data_workerOriented () {
    var weekData = { };

    for (var i = 0; i < allDataCellElements.length; i++) {
        var inputs = allDataCellElements[i].querySelectorAll("input[position]");
        var valName = inputs[0].value;

        // če ni imena, skoči na naslednjega
        if (valName == "") continue;

        var pos = allDataCellElements[i].getAttribute("position");
        var dayIndex = pos.split(",")[0];
        var oddelekId = allDataCellElements[i].getAttribute("oddelekId");
        var smena = allDataCellElements[i].getAttribute("smena");
        var startTimeVal = null;
        var endTimeVal = null;

        try {
            startTimeVal = inputs[1].value;
            endTimeVal = inputs[2].value;
        } catch (e) { 
            // do nothing
        }

        // če te osebe še ni ustvari novo
        if (!weekData[valName]) {
            weekData[valName] = [];
        }
        
        // podatki o tej celici
        var cellData = {
            position: pos,
            oddelekId: oddelekId,
            oddelekName: data.oddById[oddelekId],
            startTime: startTimeVal,
            endTime: endTimeVal,
            smena: smena,
            dayIndex: dayIndex
        }

        weekData[valName].push(cellData);
    }

    return weekData;
}

// pretvori celoten zapis zaposlenega v dnevni zapis
function get_currPlan_Worker_dayOriented (weekData) {
    var workerOrientedWeekData = { };
    var workerNames = Object.keys(weekData);

    workerNames.forEach(name => {
        // ustvarimo originalno ime, brez presledkov in odstranimo vse desno od zvezdice
        var originalName = name;
        var zvezdicaPos = originalName.indexOf("*");

        if (zvezdicaPos >= 0) {
            originalName = originalName.substring(0,zvezdicaPos);
        }
        originalName = originalName.trim();
        if (originalName == "") return;
        var nameLowerCase = originalName.toLowerCase();
        
        if (!workerOrientedWeekData[nameLowerCase]) {
            workerOrientedWeekData[nameLowerCase] = { 
                1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
            }
        }
        
        for (var i = 0; i < weekData[name].length; i++) {
            var cellData = weekData[name][i];
            cellData.originalName = originalName;
            var dayIndex = cellData.dayIndex;
            workerOrientedWeekData[nameLowerCase][dayIndex].push(cellData);
        }
    });

    return workerOrientedWeekData;
}

// ustvarimo objekt z podatki o nedelji (mesec, teden, delavci)
function get_sundayData(tableData) {
    

    var sundayDate = new Date(currDateData.workingMondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);

    var sundayData = {
        month: sundayDate.getMonth(),
        weekNumber: currDateData.workingWeekNumber,
        workers: []
    };

    var names = Object.keys(tableData);
    names.forEach(name => {
        for(var i = 0; i < tableData[name].length; i++) {
            if (tableData[name][i].dayIndex !== "7" || isSpecialOddelek(tableData[name][i])) {
                continue;
            }

            try {
                var prikazanoIme = data.zaposleni[name.toLowerCase()].prikazanoImeZap;
                if (!sundayData.workers.includes(prikazanoIme)) {
                    sundayData.workers.push(prikazanoIme);
                }
            } catch (e) { return; }
        }
    });
    
    return sundayData;
}

// ustvari objekt; key: ime zaposlenega, value: št nedelij v letu, št. nedelij v mesecu
function create_sundayData_byWorker (allSundayData) {
    // če ni vnosa končaj
    if (allSundayData.length < 1) {
        data.sundayData = null;
        return;
    } 

    var workersSundayData = { };

    var sundayDate = new Date(currDateData.selectedMondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);
    var currMonth = sundayDate.getMonth();

    allSundayData.forEach(sundayElement => {
        sundayDataJson = JSON.parse(sundayElement);
        
        // če je to teden s katerim delamo bomo preskočili
        if (sundayDataJson.weekNumber === currDateData.selectedWeekNumber) return;

        sundayDataJson.workers.forEach(name => {
            var nameLowerCase = name.toLowerCase();
            // če tega delavca še ni v objektu ga dodaj
            if (!workersSundayData[nameLowerCase]) {
                workersSundayData[nameLowerCase] = { yearSundays: 0, monthSundays: 0 }
            }

            workersSundayData[nameLowerCase].yearSundays++;
            if (currMonth === sundayDataJson.month) {
                workersSundayData[nameLowerCase].monthSundays++;
            }
        });
    });
    
    data.sundayData = workersSundayData;
}

// vrne osebe ki niso vpisane v plan dela
function get_missingPresonData (weekData) {
    var requiredNames = Object.keys(data.zaposleni).sort();

    var missingPersons = { 
        workers: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
        students: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }
    }

    requiredNames.forEach(name => {
        var subObjectName = data.zaposleni[name].student > 0 ? "students" : "workers";
        var originalName = data.zaposleni[name].prikazanoImeZap;

        // če ga sploh ni v celem tednu dodaj v vse celice
        if (!weekData[name]) {
            for (var i = 1; i < 8; i++) {
                missingPersons[subObjectName][i].push(originalName);
            }
        }
        // drugače zaroteraj po dnevih in dodaj če ga ni
        else {
            for (var i = 1; i < 8; i++) {
                if (weekData[name][i].length < 1) {
                    missingPersons[subObjectName][i].push(originalName);
                }
            }
        }
    });

    return missingPersons;
}