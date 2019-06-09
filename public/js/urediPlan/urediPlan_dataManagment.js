
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
   
    dataKeys.forEach(key => {        
        workerData = workerOrientedData[key];
        workerData.forEach(element => {
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
        let inputs = allDataCellElements[i].querySelectorAll("input");
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
        
        // podatki o tej celici
        let cellData = {
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
    let workerOrientedWeekData = { };
    let workerNames = Object.keys(weekData);

    workerNames.forEach(name => {
        // ustvarimo originalno ime, brez presledkov in odstranimo vse desno od zvezdice
        let originalName = name;
        let zvezdicaPos = originalName.indexOf("*");

        if (zvezdicaPos >= 0) {
            originalName = originalName.substring(0,zvezdicaPos);
        }
        originalName = originalName.trim();
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
    names.forEach(name => {
        for(let i = 0; i < tableData[name].length; i++) {
            if (tableData[name][i].dayIndex !== "7" || isSpecialOddelek(tableData[name][i])) {
                continue;
            }

            try {
                sundayData.workers.push(data.zaposleni[name.toLowerCase()].prikazanoImeZap);
            } catch (e) { return; }
        }
    });

    return sundayData;
}