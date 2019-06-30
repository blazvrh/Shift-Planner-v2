
// izpolni tableo z podatki iz db
function fill_table_withDbData(weekData) {
    // spremenimo tako da imamo po urejeno oddelkih/dnevih
    let tempWeekData = get_currPlan_data_dayOriented(weekData);
    
    // za vsako celico poglej če obstaja element ki ga bi lahko vstavili; potem izbriši vstavljenega iz dayOrientedData
    for (let i = 0; i < allDataCellElements.length; i++) {
        let inputElements = allDataCellElements[i].querySelectorAll("input");

        let day = ((allDataCellElements[i].getAttribute("position")).split(","))[0];
        
        let oddId = allDataCellElements[i].getAttribute("oddelekid");
        
        let cellVals = null;
        try {
            cellVals = tempWeekData[day][oddId][0];
            inputElements[0].value = cellVals.nameVal;
            if (inputElements.length > 1) {
                if (cellVals.startTime) inputElements[1].value = cellVals.startTime;
                if (cellVals.endTime) inputElements[2].value = cellVals.endTime;
            }
            tempWeekData[day][oddId].shift();
        } catch (err) { false; }
    }

    // pogledamo če smo izpisali vse; če ne potem izpiši error
    let errorMsg = "<strong><ins>Ni bilo mogoče izpisati naslednjih vnosov:</ins></strong><br>";
    var errorFound = false;

    for (let i = 1; i < 8; i++) {
        let dayName = tempWeekData[i].day;
        let danVpisan = false;
        let keys = Object.keys(tempWeekData[i]);
        keys.forEach(function(key) {
            if (key != "day") {
                let remainingValues = tempWeekData[i][key];
                
                let oddelekNameVpisan = false;
                remainingValues.forEach(function(element) {
                    errorFound = true;
                    let oddelek = element.oddName != null ? element.oddName : "";
                    let name = element.nameVal != null ? element.nameVal : "";
                    let startTime = element.startTime != null ? element.startTime : "";
                    let endTime = element.endTime != null ? element.endTime : "";

                    
                    if (name != "") {
                        if (!danVpisan) {
                            danVpisan = true;
                            errorMsg += "&emsp;<strong>" + dayName + "</strong>:<br>";
                        }
                        if (!oddelekNameVpisan) {
                            oddelekNameVpisan = true;
                            errorMsg += "&emsp;&emsp;<em>" + oddelek + "</em>:<br>";
                        }
                        errorMsg += "&emsp;&emsp;&emsp;" + name;
                    }
                    if (startTime != "") {
                        errorMsg += "&emsp; " + startTime + " - " + endTime;
                    }
                    errorMsg += "<br>";
                });
            };
        });
    }
    
    if (errorFound == true) {
        error_onTableShow (errorMsg);
    } else {
        error_onTableShow("");
    }
}