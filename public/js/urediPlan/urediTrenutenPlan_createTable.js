var currWeekNumber;
var currMondayDate;

// iz _getData nastavi potrebne spremenljivke
function setNecessaryVariables (weekNum, mondayDate) {
    currWeekNumber = weekNum;
    currMondayDate = mondayDate;
}

// ustvari novo tableo s podanim datumom
function btn_createCurrTable () {
    let mainTable = document.getElementById("mainTable");
    mainTable.innerHTML = "";
    
    var tableHeaderRow = ustvariHeader();
    mainTable.append(tableHeaderRow);
    
    pripniSmenoZaGalvnoTabelo("dopoldne", mainTable);
    
    pripniSmenoZaGalvnoTabelo("popoldne", mainTable);
    
    var newCreationDiv = document.getElementById("newCreationDiv");
    newCreationDiv.style.display = "initial";
}

// Ustvari header tabele za ustvarjanje plana
function ustvariHeader () {
    tempDate = currMondayDate;
    leto = tempDate.getFullYear();

    var rowHeader = document.createElement("tr");
    var imenaDnevov = ["Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota", "Nedelja"];
    for (let i = 0; i < 8; i++) {
        let subTable = document.createElement("table");

        // če je to prva vrsta
        if (i == 0) {
            let thData = document.createElement("th");
            thData.innerHTML = leto + " Teden: " + currWeekNumber;
            subTable.append(thData);
        }
        // če je to vrsta s tednom
        else {
            let thDataDay = document.createElement("th");
            thDataDay.innerText = imenaDnevov[i-1];
            
            let thDataDate = document.createElement("th");
            let currDatum = new Date(tempDate).toLocaleString('sl-SI',{day: "numeric", month: "long"});
            thDataDate.innerText = currDatum;
            tempDate.setDate(tempDate.getDate() + 1);
            subTable.append(thDataDay);
            subTable.append(thDataDate);
        }
        tdHead = document.createElement("td");
        tdHead.setAttribute("id", "headTd" + i);
        tdHead.setAttribute("class", "headerTd");
        tdHead.append(subTable);
        rowHeader.append(tdHead);
    }

    return rowHeader;
}

// doda celotno smeno (dop/pop) v tabelo
function pripniSmenoZaGalvnoTabelo (smena, mainTable) {
    let smenaData = JSON.parse(sessionStorage.getItem("oddelki_" + smena));

    var yPos = 0;
    var xPos = 0;
    smenaData.forEach(element => {
        for (var i = 0; i < element.stVrsticOddelka; i++)
        {
            yPos ++;
            var row = document.createElement("tr");
            for (var j = 0; j < 8; j++) {
                xPos = j;
                var cell = document.createElement("td");
                var inputElem = document.createElement("input");
                let inputElemTime1 = document.createElement("input");
                let inputElemTime2 = document.createElement("input");
                
                if (j == 0 && i == 0) {
                    cell.innerText = element.imeOddelka;
                } 
                else if (j == 0) {
                    // for setting id ...
                }
                else if (j > 0) {
                    var subTable = document.createElement("table");
                    var td1 = document.createElement("td");
                    var td2 = document.createElement("td");
                    
                    inputElem.setAttribute ("type", "text");
                    inputElem.setAttribute ("list", "imenaZaposlenih");
                    if (element.specialOddelek == "") {
                        inputElem.setAttribute ("onchange", "onChange_setUsualTimesForOddelek(this, '" + 
                            element.prihodNaOddelek + "', '" + element.odhodIzOddelka + "')");
                        }
                    elemId = "inp_name_" + smena + "_" + xPos.toString() + "," + yPos.toString();
                    inputElem.setAttribute ("id", elemId);
                    
                    td1.append(inputElem);
                    subTable.append(td1);

                    if (element.specialOddelek == "") {
                        timeId = "inp_time_" + smena + "_" + xPos.toString() + "," + yPos.toString();
                        inputElemTime1.setAttribute ("type", "time");
                        inputElemTime1.setAttribute ("id", "start_" + timeId);
                        inputElemTime2.setAttribute ("type", "time");
                        inputElemTime2.setAttribute ("id", "end_" + timeId);
    
                        td2.append(inputElemTime1);
                        td2.append(inputElemTime2); 
                        subTable.append(td2);
                    }
                    else {
                        inputElem.setAttribute ("class", "specialOddelek");
                    }
                    cell.append(subTable);
                }
                if (i == element.stVrsticOddelka - 1) {
                    cell.setAttribute ("class", "lastRowOfOddelek");
                } else {
                    cell.setAttribute ("class", "rowOfOddelek");
                }
                row.append(cell);
                row.setAttribute("id", element.key);
            }
            mainTable.append(row);
        }
    });
}