
// ustvari predogled plana za izbran teden
function create_table_selectedWeek(weekData, oddDop, oddPop, divElement, additionalDataObject) {
    var workingWeekNumber;
    var workingMondayDate;
    var poslovalnica = "";
    var noEntryText = "";
    
    if (typeof(additionalDataObject) === "undefined") {
        workingWeekNumber = currDateData.selectedWeekNumber;
        workingMondayDate = currDateData.selectedMondayDate;
        poslovalnica = userData.poslovalnica;
        noEntryText = "Za ta teden ni shranjenega vnosa!";
    }
    else {
        workingWeekNumber = additionalDataObject.weekNum;
        workingMondayDate = additionalDataObject.mondayDate;
        poslovalnica = imePoslovalnice;
        noEntryText = "Za ta teden ni objavljenega vnosa!";
    }
    
    var planDelaIzbranTedenDiv = divElement;
    
    // če je prazen objekt potem izpiši "NI VNOSA"
    if (Object.keys(weekData).length < 1) {
        planDelaIzbranTedenDiv.innerHTML = "<h3>" + noEntryText + "</h3>"
        return;
    }

    
    
    
    var tableElement = document.createElement("table");
    tableElement.setAttribute("id", "mainTable_selectedWeek");
    tableElement.setAttribute("class", "mainTable_selectedWeek");
    
    tableElement.append(ustvariHeader(workingMondayDate, workingWeekNumber));
    
    create_Smeno("dopoldne", tableElement, oddDop);
    create_Smeno("popoldne", tableElement, oddPop);

    fillTableWithData(weekData, tableElement);
    delete_emptyRows(tableElement);

    planDelaIzbranTedenDiv.innerHTML = "<h3>" + workingWeekNumber + " teden " + workingMondayDate.getFullYear() + 
        " - Poslovalnica: " + poslovalnica + "</h3>";

    planDelaIzbranTedenDiv.append(tableElement);
    
    if (typeof(additionalDataObject) === "undefined") {
        var printBtn = document.createElement("button");
        printBtn.classList.add("hideOnPrint");
        printBtn.innerHTML = "Tiskaj!";
        printBtn.onclick = function() { printPlan(); }
        planDelaIzbranTedenDiv.append(printBtn);
    }
    
    window.location.href ="#planDelaIzbranTedenDiv";
}

// Ustvari header tabele za predogled izbranega tedna
function ustvariHeader (mondayDate, weekNumber) {
    var tempDate = new Date (mondayDate);
    var leto = tempDate.getFullYear();

    var tHeader = document.createElement("thead");
    var rowHeader = document.createElement("tr");

    var imenaDnevov = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];

    for (var i = 0; i < 8; i++) {
        // če je to prva vrsta
        var thData = document.createElement("th");
        if (i == 0) {
            thData.innerText = leto + " Teden: " + weekNumber;
        }
        // če je to vrsta s tednom
        else {
            var thDataDayName = document.createElement("th");
            thDataDayName.innerText = imenaDnevov[i-1];
            
            var thDataDate = document.createElement("th");
            var currDatum = new Date(tempDate).toLocaleString('sl-SI',{day: "numeric", month: "long"});

            thData.innerHTML = imenaDnevov[i-1] + " - " + currDatum;
            
            tempDate.setDate(tempDate.getDate() + 1);
        }
        rowHeader.append(thData);
    }

    tHeader.append(rowHeader);
    return tHeader;
}

// ustvari celotno smeno (dop/pop) v tabelo
function create_Smeno (smena, mainTable, smenaData) {
    var tBody = document.createElement("tbody");

    var yPos = 0;
    var xPos = 0;
    
    // za vsak oddelek
    for (var oddNum = 0; oddNum < smenaData.length; oddNum ++) {
        // za št. vrstic tega oddelka
        for (var rowNum = 0; rowNum < smenaData[oddNum].stVrsticOddelka; rowNum++)
        {
            yPos ++;
            var row = document.createElement("tr");
            row.setAttribute("oddId", smenaData[oddNum].oddID);
            if (smenaData[oddNum].specialOddelek === "Komentar") {
                row.classList.add("komentarRow");
            }

            // za vsak dan
            for (var dayNum = 0; dayNum < 8; dayNum++) {
                xPos = dayNum;
                var cell;

                // prva celica, prve vrste oddelka
                if (dayNum == 0 && rowNum == 0) {
                    row.classList.add("firstRow");
                    cell = document.createElement("th");
                    cell.innerText = smenaData[oddNum].imeOddelka;
                }
                // če je prvi stolpec ampak ni prva vrstica, samo dodaj prazno celico
                else if (dayNum == 0) {
                    cell = document.createElement("th");
                }
                // če je celica z dnevom (ni prvi stolpec)
                else if (dayNum > 0) {
                    cell = document.createElement("td");
                }

                // dodamo position atribute še celici
                cell.setAttribute ("position", xPos + "," + yPos);
                cell.setAttribute ("smena", smena);
                cell.setAttribute ("oddelekName", smenaData[oddNum].imeOddelka);
                
                row.append(cell);
            }
            tBody.append(row);
        }
    }
    mainTable.append(tBody);
}


function fillTableWithData(weekData, wholeTable) {
    var workerNames = Object.keys(weekData);

    workerNames.forEach(name => {
        for (var i = 0; i < weekData[name].length; i++) {
            var cellData = weekData[name][i];
            
            var position = cellData.position;
            var smena = cellData.smena;
            var casDela = "";
            
            if (cellData.startTime !== null && cellData.startTime !== "" && cellData.endTime !== null && cellData.endTime !== "") {
                casDela = cellData.startTime + " - " + cellData.endTime;
            }

            var matchingCell = wholeTable.querySelector("td[position='" + position + "'][smena='" + smena + "']");

            var nameSpan = document.createElement("span");
            nameSpan.classList.add("nameValue");
            nameSpan.innerHTML = name;
            matchingCell.append(nameSpan);
            
            if (casDela !== "") {
                var timeSpan = document.createElement("span");
                timeSpan.classList.add("timeValue");
                timeSpan.innerHTML = casDela;
                matchingCell.append(timeSpan);
            }
        }
    });
}

function delete_emptyRows (table) {
    var rows = table.querySelectorAll("tr[oddId]");
    var rowsByOddelekId = {};

    for (var i = 0; i < rows.length; i++) {
        var oddId = rows[i].getAttribute("oddId");
        
        if (!rowsByOddelekId[oddId]) {
            rowsByOddelekId[oddId] = [];
        }
        
        rowsByOddelekId[oddId].push(rows[i]);
    }

    var rowKeys = Object.keys(rowsByOddelekId);

    rowKeys.forEach(rowKey => {
        var headerDeleted = false;
        var headerName = "";
        for (var j = 0; j < rowsByOddelekId[rowKey].length; j++) {
            var row = rowsByOddelekId[rowKey][j];
            var tdCells = row.querySelectorAll("td");
            
            var isEmptyRow = true;
            for (var i = 0; i < tdCells.length; i++) {
                if (tdCells[i].innerText !== "") {
                    isEmptyRow = false;
                    break;
                }
            }
            
            var header = row.querySelector("th");
            if (isEmptyRow) {
                if (header.innerHTML !== "") {
                    headerDeleted = true;
                    headerName = header.innerHTML;
                }
                table.deleteRow(row.rowIndex);
            }
            // če je bilo ime oddelka izbrisano in smo našli vrstico na istem oddelku
            else if (headerDeleted) {
                row.classList.add("firstRow");
                header.innerHTML = headerName;
                headerDeleted = false;
            }
        }
    });
}