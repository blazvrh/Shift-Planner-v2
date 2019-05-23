
// ustvari novo tableo s podanim datumom
function btn_createCurrTable () {
    var tableZaPlan = document.getElementById("tableZaPlan");
    error_onTableShow("");
    tableZaPlan.style.display = "none";

    currDateData.workingWeekNumber = currDateData.selectedWeekNumber;
    currDateData.workingMondayDate = currDateData.selectedMondayDate;

    let mainTableDiv = document.getElementById("creationTable");
    mainTableDiv.innerHTML = "";
    
    tableElement = document.createElement("table");
    tableElement.append(ustvariHeader());
    
    pripniSmenoZaGalvnoTabelo("dopoldne", tableElement);
    pripniSmenoZaGalvnoTabelo("popoldne", tableElement);
    
    tableElement.setAttribute("id", "mainTable");
    
    mainTableDiv.append(tableElement);

    allDataCellElements = document.querySelectorAll("#mainTable td[position]");
    
    submitForm_get_trenuenPlan();
    submitForm_get_lastWeekPlan();

    tableZaPlan.style.display = "initial";
}

// Ustvari header tabele za ustvarjanje plana
function ustvariHeader () {
    let tempDate = new Date (currDateData.selectedMondayDate);
    let leto = tempDate.getFullYear();

    let tHeader = document.createElement("thead");
    var rowHeader = document.createElement("tr");

    var imenaDnevov = ["Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota", "Nedelja"];

    for (let i = 0; i < 8; i++) {
        let subTable = document.createElement("table");

        // če je to prva vrsta
        if (i == 0) {
            let thData = document.createElement("th");
            thData.innerText = leto + " Teden: " + currDateData.selectedWeekNumber;
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
        let tdHead = document.createElement("td");
        // tdHead.setAttribute("id", "headTd" + i);
        // tdHead.setAttribute("class", "headerTd");
        tdHead.append(subTable);
        rowHeader.append(tdHead);
    }

    tHeader.append(rowHeader);
    return tHeader;
}

// doda celotno smeno (dop/pop) v tabelo
function pripniSmenoZaGalvnoTabelo (smena, mainTable) {
    let smenaData = data["oddelki_" + smena];

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
            // za vsak dan
            for (var dayNum = 0; dayNum < 8; dayNum++) {
                xPos = dayNum;
                var cell;

                // prva celica, prve vrste oddelka
                if (dayNum == 0 && rowNum == 0) {
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
                    var subTable = document.createElement("table");
                    
                    // text input za ime
                    var inputElem_name = document.createElement("input");
                    inputElem_name.setAttribute ("type", "text");
                    inputElem_name.setAttribute ("list", "imenaZaposlenih");
                    inputElem_name.setAttribute ("class", "imeZap");

                    // če je normalen oddelek dodamo lisener onblur
                    if (smenaData[oddNum].specialOddelek == "") {
                        inputElem_name.onblur = function() {
                            onBlur_name_setUsualTimesForOddelek(this, smenaData[oddNum].prihod, 
                                smenaData[oddNum].odhod)
                        }
                    }
                    
                    // dodamo position attribute
                    inputElem_name.setAttribute ("position", xPos + "," + yPos);
                    inputElem_name.setAttribute ("smena", smena);
                    // inputElem_name.setAttribute ("oddelekId", smenaData[oddNum].oddID);
                    
                    // dodamo v celico za ime in v pod-tabelo
                    var tdNameInp = document.createElement("td");
                    tdNameInp.append(inputElem_name);
                    subTable.append(tdNameInp);

                    // če ni SPECIAL oddelek
                    if (smenaData[oddNum].specialOddelek == "") {
                        let inputElemTime = [document.createElement("input"), document.createElement("input")];
                        let tdHourInp = document.createElement("td");
                        
                        for (let i = 0; i < inputElemTime.length; i++) {
                            let element = inputElemTime[i];
                            element.setAttribute ("type", "time");
                            // dodamo position in class (start/end) attribute
                            element.setAttribute ("position", xPos + "," + yPos);
                            element.setAttribute ("smena", smena);

                            if (i == 0) { element.setAttribute ("class", "startTime"); }
                            else { element.setAttribute ("class", "endTime"); }

                            // auto fill on blur za time
                            element.onblur = function() {
                                onBlur_time_setUsualTimesForOddelek(this, smenaData[oddNum].prihod, 
                                    smenaData[oddNum].odhod)
                            }
                            // element.setAttribute ("oddelekId", smenaData[oddNum].oddID);

                            tdHourInp.append(element);
                        }

                        subTable.append(tdHourInp);
                    }
                    // če je SPECIAL oddelek
                    else {
                        let specType = smenaData[oddNum].specialOddelek == "Komentar" ? "komentar" : "dopustiBoln";
                        
                        inputElem_name.setAttribute ("class", inputElem_name.getAttribute ("class") + 
                            " specialOddelek " + specType);
                    }
                    
                    // tooltip ...
                    cell.classList.add("tooltip");

                    // za pozicijo tooltipa
                    let posDiv = document.createElement("div"); 
                    posDiv.classList.add("tooltipPos");
                    
                    let toolTipTextDiv = document.createElement("div");
                    toolTipTextDiv.classList.add("tooltipText");
                    toolTipTextDiv.setAttribute("isEmpty", "true");
                    toolTipTextDiv.setAttribute ("fullPosition", xPos + "," + yPos + "," + smena);
                    posDiv.append(toolTipTextDiv);
                    cell.append(posDiv);
                    cell.append(subTable);
                }

                // če je zadnja vrstica potem dodamo class - za style
                if (rowNum == smenaData[oddNum].stVrsticOddelka - 1) {
                    cell.classList.add("lastRowOfOddelek");
                } else {
                    cell.classList.add("rowOfOddelek");
                }

                // dodamo position atribute še celici
                cell.setAttribute ("position", xPos + "," + yPos);
                cell.setAttribute ("smena", smena);
                cell.setAttribute ("oddelekId", smenaData[oddNum].oddID);
                
                row.append(cell);
                row.setAttribute("id", smenaData[oddNum].oddID);
            }
            tBody.append(row);
        }
    }
    mainTable.append(tBody);
}