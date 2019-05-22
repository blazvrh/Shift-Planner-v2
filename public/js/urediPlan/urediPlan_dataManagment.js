
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
function get_currPlan_data_workerOriented (stripNameBool) {
    if (stripNameBool == null) stripNameBool = false;
    let weekData = { };

    for (let i = 0; i < allDataCellElements.length; i++) {
        let inputs = allDataCellElements[i].querySelectorAll("input");
        let valName = inputs[0].value;

        // odstrani presledke na začetku in na koncu ter pobriše vse kar je desno od "*" zvezdice
        // samo če je stripNameBool = true -> pri preverjanju pravil
        if (stripNameBool) {
            let zvezdicaPos = valName.indexOf("*");

            if (zvezdicaPos >= 0) {
                valName = valName.substring(0,zvezdicaPos);
            }
            valName = valName.trim();                
        }

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
function get_currPlan_worker_dayOriented (workerData) {
    let dayOrientedWorkerData = {};

    allKeys = Object.keys(workerData);

    allKeys.forEach(key => {
        let cellData = workerData[key];
        let dayIndex = cellData.dayIndex;

        if(!(dayIndex in dayOrientedWorkerData)) {
            dayOrientedWorkerData[dayIndex] = [];
        }

        dayOrientedWorkerData[dayIndex].push(cellData);
    });

    return dayOrientedWorkerData;
}