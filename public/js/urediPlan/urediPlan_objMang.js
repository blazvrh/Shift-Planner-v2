
// izpolni tableo z podatki iz db
function fill_table_withDbData(weekData) {
    // spremenimo tako da imamo po urejeno oddelkih/dnevih
    var tempWeekData = get_currPlan_data_dayOriented(weekData);
    
    // za vsako celico poglej če obstaja element ki ga bi lahko vstavili; potem izbriši vstavljenega iz dayOrientedData
    for (var i = 0; i < allDataCellElements.length; i++) {
        var inputElements = allDataCellElements[i].querySelectorAll("input");

        var day = ((allDataCellElements[i].getAttribute("position")).split(","))[0];
        
        var oddId = allDataCellElements[i].getAttribute("oddelekid");
        
        var cellVals = null;
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
    var errorMsg = "<strong><ins>Ni bilo mogoče izpisati naslednjih vnosov:</ins></strong><br>";
    var errorFound = false;

    for (var i = 1; i < 8; i++) {
        var dayName = tempWeekData[i].day;
        var danVpisan = false;
        var keys = Object.keys(tempWeekData[i]);
        keys.forEach(key => {
            if (key != "day") {
                var remainingValues = tempWeekData[i][key];
                
                var oddelekNameVpisan = false;
                remainingValues.forEach(element => {
                    errorFound = true;
                    var oddelek = element.oddName != null ? element.oddName : "";
                    var name = element.nameVal != null ? element.nameVal : "";
                    var startTime = element.startTime != null ? element.startTime : "";
                    var endTime = element.endTime != null ? element.endTime : "";

                    
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