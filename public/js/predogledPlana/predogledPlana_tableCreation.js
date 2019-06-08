
// ustvari predogled plana za izbran teden
function create_table_selectedWeek(weekData, oddDop, oddPop) {
    let planDelaIzbranTedenDiv = document.getElementById("planDelaIzbranTedenDiv");
    
    // če je prazen objekt potem izpiši "NI VNOSA"
    if (Object.keys(weekData).length < 1) {
        planDelaIzbranTedenDiv.innerHTML = "<h3>Za ta teden ni shranjenega vnosa!</h3>"
        return;
    }

    let workingWeekNumber = currDateData.selectedWeekNumber;
    let workingMondayDate = currDateData.selectedMondayDate;
    
    
    let tableElement = document.createElement("table");
    tableElement.setAttribute("id", "mainTable_selectedWeek");
    
    tableElement.append(ustvariHeader(workingMondayDate, workingWeekNumber));
    
    create_Smeno("dopoldne", tableElement, oddDop);
    create_Smeno("popoldne", tableElement, oddPop);

    fillTableWithData(weekData, tableElement);
    delete_emptyRows(tableElement);

    planDelaIzbranTedenDiv.innerHTML = "<h3>" + workingWeekNumber + " teden " + workingMondayDate.getFullYear() + 
        " - Poslovalnica: " + userData.poslovalnica + "</h3>";

    planDelaIzbranTedenDiv.append(tableElement);
    
    let printBtn = document.createElement("button");
    printBtn.classList.add("hideOnPrint");
    printBtn.innerHTML = "Tiskaj!";
    printBtn.onclick = function() { printPlan(); }
    planDelaIzbranTedenDiv.append(printBtn);
    
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
    for (let oddNum = 0; oddNum < smenaData.length; oddNum ++) {
        // za št. vrstic tega oddelka
        for (var rowNum = 0; rowNum < smenaData[oddNum].stVrsticOddelka; rowNum++)
        {
            yPos ++;
            var row = document.createElement("tr");
            row.setAttribute("oddId", smenaData[oddNum].oddID);

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

                // // če je zadnja vrstica potem dodamo class - za style
                // if (rowNum == smenaData[oddNum].stVrsticOddelka - 1) {
                //     cell.classList.add("lastRowOfOddelek");
                // } else {
                //     cell.classList.add("rowOfOddelek");
                // }

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
    const workerNames = Object.keys(weekData);

    workerNames.forEach(name => {
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
            matchingCell.append(nameSpan);
            
            if (casDela !== "") {
                let timeSpan = document.createElement("span");
                timeSpan.classList.add("timeValue");
                timeSpan.innerHTML = casDela;
                matchingCell.append(timeSpan);
            }
        }
    });
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

    rowKeys.forEach(rowKey => {
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
    });
}