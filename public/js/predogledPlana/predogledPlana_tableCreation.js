
// ustvari predogled plana za izbran teden
function create_table_selectedWeek(weekData, oddDop, oddPop, divElement, additionalDataObject) {
    let workingWeekNumber;
    let workingMondayDate;
    let poslovalnica = "";
    let noEntryText = "";
    
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
    
    let planDelaIzbranTedenDiv = divElement;
    
    // če je prazen objekt potem izpiši "NI VNOSA"
    if (Object.keys(weekData).length < 1) {
        planDelaIzbranTedenDiv.innerHTML = "<h3>" + noEntryText + "</h3>"
        return;
    }

    
    
    
    let tableElement = document.createElement("table");
    tableElement.setAttribute("id", "mainTable_selectedWeek");
    tableElement.setAttribute("class", "mainTable_selectedWeek");
    
    
    tableElement.appendChild(ustvariHeader(workingMondayDate, workingWeekNumber));
    
    create_Smeno("dopoldne", tableElement, oddDop);
    create_Smeno("popoldne", tableElement, oddPop);

    fillTableWithData(weekData, tableElement);
    delete_emptyRows(tableElement);

    planDelaIzbranTedenDiv.innerHTML = "<h3>" + workingWeekNumber + " teden " + workingMondayDate.getFullYear() + 
        " - Poslovalnica: " + poslovalnica + "</h3>";

    planDelaIzbranTedenDiv.appendChild(tableElement);
    
    if (typeof(additionalDataObject) === "undefined") {
        let printBtn = document.createElement("button");
        printBtn.classList.add("hideOnPrint");
        printBtn.innerHTML = "Tiskaj!";
        printBtn.onclick = function() { printPlan(); }
        planDelaIzbranTedenDiv.appendChild(printBtn);
    }
    
    window.location.href ="#planDelaIzbranTedenDiv";
}

// Ustvari header tabele za predogled izbranega tedna
function ustvariHeader (mondayDate, weekNumber) {
    let tempDate = new Date (mondayDate);
    let leto = tempDate.getFullYear();

    let tHeader = document.createElement("thead");
    var rowHeader = document.createElement("tr");

    var imenaDnevov = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];

    for (let i = 0; i < 8; i++) {
        // če je to prva vrsta
        let thData = document.createElement("th");
        if (i == 0) {
            thData.innerText = leto + " Teden: " + weekNumber;
        }
        // če je to vrsta s tednom
        else {
            let thDataDayName = document.createElement("th");
            thDataDayName.innerText = imenaDnevov[i-1];
            
            let thDataDate = document.createElement("th");
            let currDatum = new Date(tempDate).toLocaleString('sl-SI',{day: "numeric", month: "long"});

            thData.innerHTML = imenaDnevov[i-1] + " - " + currDatum;
            
            tempDate.setDate(tempDate.getDate() + 1);
        }
        rowHeader.appendChild(thData);
    }

    tHeader.appendChild(rowHeader);
    return tHeader;
}

// ustvari celotno smeno (dop/pop) v tabelo
function create_Smeno (smena, mainTable, smenaData) {
    var tBody = document.createElement("tbody");

    var yPos = 0;
    var xPos = 0;
    
    // za vsak oddelek
    for (let oddNum = 0; oddNum < smenaData.length; oddNum ++) {
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
                
                row.appendChild(cell);
            }
            tBody.appendChild(row);
        }
    }
    mainTable.appendChild(tBody);
}


function fillTableWithData(weekData, wholeTable) {
    const workerNames = Object.keys(weekData);

    for (let j = 0; j < workerNames.length; j++) {
        const name = workerNames[j];
        for (let i = 0; i < weekData[name].length; i++) {
            const cellData = weekData[name][i];
            
            const position = cellData.position;
            const smena = cellData.smena;
            let casDela = "";
            
            if (cellData.startTime !== null && cellData.startTime !== "" && cellData.endTime !== null && cellData.endTime !== "") {
                casDela = cellData.startTime + " - " + cellData.endTime;
            }

            let matchingCell = wholeTable.querySelector("td[position='" + position + "'][smena='" + smena + "']");

            let nameSpan = document.createElement("span");
            nameSpan.classList.add("nameValue");
            nameSpan.innerHTML = name;
            matchingCell.appendChild(nameSpan);
            
            if (casDela !== "") {
                let timeSpan = document.createElement("span");
                timeSpan.classList.add("timeValue");
                timeSpan.innerHTML = casDela;
                matchingCell.appendChild(timeSpan);
            }
        }
    }
}

function delete_emptyRows (table) {
    let rows = table.querySelectorAll("tr[oddId]");
    let rowsByOddelekId = {};

    for (let i = 0; i < rows.length; i++) {
        const oddId = rows[i].getAttribute("oddId");
        
        if (!rowsByOddelekId[oddId]) {
            rowsByOddelekId[oddId] = [];
        }
        
        rowsByOddelekId[oddId].push(rows[i]);
    }

    const rowKeys = Object.keys(rowsByOddelekId);

    for (let k = 0; k < rowKeys.length; k++) {
        let rowKey = rowKeys[k];
        let headerDeleted = false;
        let headerName = "";
        for (let j = 0; j < rowsByOddelekId[rowKey].length; j++) {
            let row = rowsByOddelekId[rowKey][j];
            let tdCells = row.querySelectorAll("td");
            
            let isEmptyRow = true;
            for (let i = 0; i < tdCells.length; i++) {
                if (tdCells[i].innerText !== "") {
                    isEmptyRow = false;
                    break;
                }
            }
            
            const header = row.querySelector("th");
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
    }
}