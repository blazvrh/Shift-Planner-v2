
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
    
    let dataKeys = Object.keys(workerOrientedData);
   
    dataKeys.forEach(function(key) {        
        workerData = workerOrientedData[key];
        workerData.forEach(function(element) {
            let day = element.dayIndex;
            let startTime = element.startTime;
            let endTime = element.endTime;
            let oddId = element.oddelekId;
            
            if (!dayOrientedData[day][oddId]) {
                dayOrientedData[day][oddId] = [];
            }
            let cellData = { nameVal: key, oddName: element.oddelekName };
            
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
    let weekData = { };

    for (let i = 0; i < allDataCellElements.length; i++) {
        let inputs = allDataCellElements[i].querySelectorAll("input[position]");
        let valName = inputs[0].value;

        // če ni imena, skoči na naslednjega
        if (valName == "") continue;

        let pos = allDataCellElements[i].getAttribute("position");
        let dayIndex = pos.split(",")[0];
        let oddelekId = allDataCellElements[i].getAttribute("oddelekId");
        let smena = allDataCellElements[i].getAttribute("smena");
        let startTimeVal = null;
        let endTimeVal = null;

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
        // pridobimo id zaposlenega če ta obstaja
        let zapId = -1;
        try {
            zapId = data.zaposleni[strip_nameInputValue(valName).toLowerCase()].zapID;
            
            // zapId = data.zaposleni[strip_nameInputValue(valname)].zapID;
        } catch (e) { }

        // podatki o tej celici
        let cellData = {
            position: pos,
            oddelekId: oddelekId,
            oddelekName: data.oddById[oddelekId],
            startTime: startTimeVal,
            endTime: endTimeVal,
            smena: smena,
            dayIndex: dayIndex,
            zapId: zapId
        }

        weekData[valName].push(cellData);
    }

    return weekData;
}

// pretvori celoten zapis zaposlenega v dnevni zapis
function get_currPlan_Worker_dayOriented (weekData) {
    let workerOrientedWeekData = { };
    let workerNames = Object.keys(weekData);

    workerNames.forEach(function(name) {
        // ustvarimo originalno ime, brez presledkov in odstranimo vse desno od zvezdice
        const stripedName = strip_nameInputValue(name).toLowerCase();
        let originalName = ""
        
        try {
            let workerIndex = weekData[stripedName][0].zapId;
            const workersById = create_workersByIdObject();
    
            if (workerIndex != null && workerIndex > -1) {
                originalName = workersById[workerIndex];
            } else {
                originalName = stripedName;
            }
        } catch (e) {
            originalName = stripedName;            
        }
        
        if (typeof(originalName) === "undefined") originalName = stripedName;
        
        if (originalName == "") return;
        
        let nameLowerCase = originalName.toLowerCase();
        
        if (!workerOrientedWeekData[nameLowerCase]) {
            workerOrientedWeekData[nameLowerCase] = { 
                1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
            }
        }
        
        for (let i = 0; i < weekData[name].length; i++) {
            let cellData = weekData[name][i];
            cellData.originalName = originalName;
            let dayIndex = cellData.dayIndex;
            workerOrientedWeekData[nameLowerCase][dayIndex].push(cellData);
        }
    });

    return workerOrientedWeekData;
}

// izbere samo ime iz name input fielda
function strip_nameInputValue (inputValue) {
    let zvezdicaPos = inputValue.indexOf("*");
    let stripedName = "";

    if (zvezdicaPos >= 0) {
        stripedName = inputValue.substring(0,zvezdicaPos);
    } else {
        stripedName = inputValue;
    }
    stripedName = stripedName.trim();

    return stripedName;
}

// ustvarimo objekt z podatki o nedelji (mesec, teden, delavci)
function get_sundayData(tableData) {
    
    let sundayDate = new Date(currDateData.workingMondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);

    let sundayData = {
        month: sundayDate.getMonth(),
        weekNumber: currDateData.workingWeekNumber,
        workers: []
    };

    const names = Object.keys(tableData);
    names.forEach(function(name) {
        for(let i = 0; i < tableData[name].length; i++) {
            if (tableData[name][i].dayIndex !== "7" || isSpecialOddelek(tableData[name][i])) {
                continue;
            }
            
            const cell = tableData[name][i];
            if (cell.zapId >= 0 && sundayData.workers.indexOf(cell.zapId) < 0) {
                sundayData.workers.push(cell.zapId);
            }
        }
    });
    
    return sundayData;
}


// create object of workers by id; key: worker ID, value: lowercase worker name
function create_workersByIdObject () {
    const allNames = Object.keys(data.zaposleni);
    let workerObject = { };

    for (let n = 0; n < allNames.length; n++) {
        let name = allNames[n];
        workerObject[data.zaposleni[name].zapID] = name;
    }
    
    return workerObject;
}

// ustvari objekt; key: ime zaposlenega, value: št nedelij v letu, št. nedelij v mesecu
function create_sundayData_byWorker (allSundayData) {
    // če ni vnosa končaj
    if (allSundayData.length < 1) {
        data.sundayData = null;
        return;
    } 

    let workersById = create_workersByIdObject();
    let workersSundayData = { };

    let sundayDate = new Date(currDateData.selectedMondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);
    const currMonth = sundayDate.getMonth();

    allSundayData.forEach(function(sundayElement) {
        sundayDataJson = JSON.parse(sundayElement);
        
        // če je to teden s katerim delamo bomo preskočili
        if (sundayDataJson.weekNumber === currDateData.selectedWeekNumber) return;

        // sundayDataJson.workers.forEach(function(name) {

            // const nameLowerCase = name.toLowerCase();
            
        sundayDataJson.workers.forEach(function(zapId) {
            const nameLowerCase = workersById[zapId];

            // console.log(zapId);
            
            // console.log(nameLowerCase);
            
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

function create_holidayData_byWorker (rawData) {
    // če ni vnosa
    if (rawData.length < 1) return;

    let workersById = create_workersByIdObject();

    // console.log(workersById);
    

    for (let i = 0; i < rawData.length; i++) {
        const weekHolidayData = JSON.parse(rawData[i]);
        // če so to podatki od trenutnega tedna nas ne zanimajo
        if (weekHolidayData.weekNumber === currDateData.selectedWeekNumber) continue;

        // if ()
        // console.log(weekHolidayData);
        
    }
    
}


// vrne osebe ki niso vpisane v plan dela
function get_missingPresonData (weekData) {
    const requiredNames = Object.keys(data.zaposleni).sort();

    let missingPersons = { 
        workers: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
        students: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }
    }

    requiredNames.forEach(function(name) {
        const subObjectName = data.zaposleni[name].student > 0 ? "students" : "workers";
        const originalName = data.zaposleni[name].prikazanoImeZap;

        // če ga sploh ni v celem tednu dodaj v vse celice
        if (!weekData[name]) {
            for (let i = 1; i < 8; i++) {
                missingPersons[subObjectName][i].push(originalName);
            }
        }
        // drugače zaroteraj po dnevih in dodaj če ga ni
        else {
            for (let i = 1; i < 8; i++) {
                if (weekData[name][i].length < 1) {
                    missingPersons[subObjectName][i].push(originalName);
                }
            }
        }
    });

    return missingPersons;
}


function get_praznikiData_currentWeek (weekData) {
    // objekt z podatki o praznikih
    let weekHolidayData = { 
        weekNumber: currDateData.workingWeekNumber,
        dnevi: [],
        workers: {}
    };

    // pogledamo kateri dnevi so prazniki
    let holidayDays = [];
    let holidaySelects = document.querySelectorAll("select[dayIndex]");
    
    for (let s = 0; s < holidaySelects.length; s++) {
        selectElement = holidaySelects[s];
        if (selectElement.value === "jePraznik") {
            holidayDays.push(selectElement.getAttribute("dayIndex"));
        }
    }

    weekHolidayData.holidayDays = holidayDays;

    // preverimo za vsako ime če dela na praznik
    const allNames = Object.keys(weekData);
    allNames.forEach(function(name) {
        // če imena ni na seznamu zaposlenih, preskoči
        if (!isNameInWorkerList(name)) return;
        
        // za vsak praznični dan
        for (let i = 0; i < holidayDays.length; i++) {
            const dayIndexInt = parseInt(holidayDays[i]);
            
            const dayData = weekData[name][dayIndexInt];
            for (let d = 0; d < dayData.length; d++) {
                // če je poseben oddelek (komentar ...) preskočimo
                if (isSpecialOddelek(dayData[d])) {
                    continue;
                } else {
                    // če imena še ni v objektu, ga ustverimo
                    if (weekHolidayData.workers[name] == null) {
                        weekHolidayData.workers[name] = {
                            workerId: data.zaposleni[name].zapID,
                            currWorkerName: name,
                            numOfWorkingHolidaysInWeek: 1
                        }
                    } else {
                        weekHolidayData.workers[name].numOfWorkingHolidaysInWeek++;
                    }
                    break;
                }
            }
        }
    });

    // če ni nobenega zaposlenega na praznik, vrni prazen objekt, drugače vrni objekt s podatki
    if (Object.keys(weekHolidayData.workers).length > 0) {
        return weekHolidayData;
    } else {
        return { };
    }
}

function isNameInWorkerList (name) {
    name = name.toLowerCase();
    const allNames = Object.keys(data.zaposleni);

    if (allNames.indexOf(name) > 1) {
        return true;
    } else { 
        return false;
    }
}

