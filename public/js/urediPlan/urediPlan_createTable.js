
// ustvari novo tableo s podanim datumom
function btn_createCurrTable () {
    buttonElements.btn_showWeek.disabled = true;

    var tableZaPlan = document.getElementById("tableZaPlan");
    tableZaPlan.style.display = "none";
    error_onTableShow("");

    currDateData.workingWeekNumber = currDateData.selectedWeekNumber;
    currDateData.workingMondayDate = currDateData.selectedMondayDate;

    let mainTableDiv = document.getElementById("creationTable");
    mainTableDiv.innerHTML = "";
    
    tableElement = document.createElement("table");
    tableElement.appendChild(ustvariHeader());
    
    pripniSmenoZaGalvnoTabelo("dopoldne", tableElement);
    pripniSmenoZaGalvnoTabelo("popoldne", tableElement);
    
    tableElement.setAttribute("id", "mainTable");
    
    mainTableDiv.appendChild(tableElement);

    allDataCellElements = document.querySelectorAll("#mainTable td[position]");
    
    create_simpleClickWorkers(data.zaposleni);

    submitForm_get_trenuenPlan();
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
            subTable.appendChild(thData);
        }
        // če je to vrsta s tednom
        else {
            let thDataDay = document.createElement("th");
            thDataDay.innerText = imenaDnevov[i-1];
            
            let thDataDate = document.createElement("th");
            let currDatum = new Date(tempDate).toLocaleString('sl-SI',{day: "numeric", month: "long"});

            thDataDate.innerText = currDatum;
            tempDate.setDate(tempDate.getDate() + 1);

            subTable.appendChild(thDataDay);
            subTable.appendChild(thDataDate);
        }
        let tdHead = document.createElement("td");
        tdHead.appendChild(subTable);
        rowHeader.appendChild(tdHead);
    }

    tHeader.appendChild(rowHeader);

    let praznikiRow = document.createElement("tr");

    for (let i = 0; i < 8; i++) {
        let cell = document.createElement("td");
        if (i > 0) {
            cell.innerHTML = "Praznik?";
        }
        praznikiRow.appendChild(cell);
    }

    tHeader.appendChild(praznikiRow);

    return tHeader;
}

// doda celotno smeno (dop/pop) v tabelo
function pripniSmenoZaGalvnoTabelo (smena, mainTable) {
    let smenaData = data["oddelki_" + smena];

    var tBody = document.createElement("tbody");

    var yPos = 0;
    var xPos = 0;
    
    // za vsak oddelek
    for (let oddNum = 0; oddNum < smenaData.length; oddNum++) {
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
                    inputElem_name.onmousedown = function() { simpleClick_input(this) };
                    
                    inputElem_name.onchange = function() { onDataChange() };
                    
                    // če je normalen oddelek dodamo lisener onblur
                    if (smenaData[oddNum].specialOddelek == "") {
                        // max dolžina inputa za ime
                        inputElem_name.setAttribute ("maxlength", "20");
                        inputElem_name.setAttribute ("oddIndex", oddNum);
                        inputElem_name.onblur = function() {
                            let oddIndex = this.getAttribute("oddIndex");
                            
                            onBlur_name_setUsualTimesForOddelek(this, smenaData[oddIndex].prihod, 
                                smenaData[oddIndex].odhod)
                        }
                    } else {
                        // max dolžina inputa za poseben oddelek
                        inputElem_name.setAttribute ("maxlength", "30");
                    }
                    
                    // dodamo position attribute
                    inputElem_name.setAttribute ("position", xPos + "," + yPos);
                    inputElem_name.setAttribute ("smena", smena);
                    // inputElem_name.setAttribute ("oddelekId", smenaData[oddNum].oddID);
                    
                    // ustvarimo error in warning index
                    let warnIndex = document.createElement("div");
                    warnIndex.setAttribute("fullPosition", xPos + "," + yPos + "," + smena);
                    warnIndex.setAttribute("indexType", "warning");
                    warnIndex.classList.add("hide");
                    // warnIndex.innerHTML = "<p>12</p>"
                    
                    let errIndex = document.createElement("div");
                    errIndex.setAttribute("fullPosition", xPos + "," + yPos + "," + smena);
                    errIndex.setAttribute("indexType", "error");
                    errIndex.classList.add("hide");
                    // errIndex.innerHTML = "<p>3</p>"

                    let errorIndexContenier = document.createElement("div");
                    errorIndexContenier.className = "errWarnIndexConteiner";
                    errorIndexContenier.appendChild(warnIndex);
                    errorIndexContenier.appendChild(errIndex);
                    // dodamo v celico za ime in v pod-tabelo
                    var tdNameInp = document.createElement("td");
                    // tdNameInp.appendChild(warnIndex);
                    // tdNameInp.appendChild(errIndex);

                    
                    let rowError = document.createElement("tr");
                    let rowData = document.createElement("tr");


                    tdNameInp.appendChild(errorIndexContenier);
                    tdNameInp.appendChild(inputElem_name);
                    subTable.appendChild(tdNameInp);

                    // če ni SPECIAL oddelek
                    if (smenaData[oddNum].specialOddelek == "") {
                        let inputElemTime = [document.createElement("input"), document.createElement("input")];
                        let tdHourInp = document.createElement("td");
                        
                        for (let i = 0; i < inputElemTime.length; i++) {
                            let element = inputElemTime[i];
                            // element.setAttribute ("type", "time");
                            element.setAttribute ("type", "text");
                            
                            add_liseners_toTextInputWithTime(element);
                            element.setAttribute ("inputType", "txtTime");
                            // element.classList.add("textTime");
                            
                            // dodamo position in class (start/end) attribute
                            element.setAttribute ("position", xPos + "," + yPos);
                            element.setAttribute ("smena", smena);

                            if (i == 0) { element.setAttribute ("class", "startTime"); }
                            else { element.setAttribute ("class", "endTime"); }

                            element.setAttribute("oddIndex", oddNum);
                            // auto fill on blur za time
                            if (element.addEventListener)  // W3C DOM
                            element.addEventListener("blur", function(evt) {
                                    let oddIndex = this.getAttribute("oddIndex");
                                    onBlur_time_setUsualTimesForOddelek(this, smenaData[oddIndex].prihod, 
                                        smenaData[oddIndex].odhod)
                                });
                            else if (element.attachEvent) { // IE DOM
                                element.attachEvent("onblur", function(evt) {
                                    let oddIndex = this.getAttribute("oddIndex");
                                    onBlur_time_setUsualTimesForOddelek(this, smenaData[oddIndex].prihod, 
                                        smenaData[oddIndex].odhod)
                                });
                            }
                            // element.onblur = function() {
                            //     let oddIndex = this.getAttribute("oddIndex");
                            //     onBlur_time_setUsualTimesForOddelek(this, smenaData[oddIndex].prihod, 
                            //         smenaData[oddIndex].odhod)
                            // };

                            element.onfocus = function() { timeValOnFocus = this.value };
                            // element.setAttribute ("oddelekId", smenaData[oddNum].oddID);

                            tdHourInp.appendChild(element);
                        }

                        subTable.appendChild(tdHourInp);
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
                    posDiv.appendChild(toolTipTextDiv);
                    cell.appendChild(posDiv);
                    cell.appendChild(subTable);
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
                
                row.appendChild(cell);
                row.setAttribute("id", smenaData[oddNum].oddID);
            }
            tBody.appendChild(row);
        }
    }
    mainTable.appendChild(tBody);
}


function create_simpleClickWorkers(zaposleniData) {
    let conteinerDiv = document.getElementById("simpleClickNames");
    conteinerDiv.innerHTML = "";
    
    const allNames = Object.keys(zaposleniData).sort();

    let studentNames = [];

    allNames.forEach(function(name) {
        const originalName = zaposleniData[name].prikazanoImeZap;
        if (zaposleniData[name].student !== 0) {
            studentNames.push(originalName);
            return;
        }
        let nameDiv = document.createElement("div");
        nameDiv.innerHTML = originalName;
        nameDiv.setAttribute("val", originalName);
        nameDiv.onclick = function() { simpleClick_setValue(this) };
        nameDiv.className = "unselectedName";
        
        conteinerDiv.appendChild(nameDiv);
    });

    // ustvarimo študente
    let studnetTitle = document.createElement("p");
    studnetTitle.innerText = "Študenti:";
    conteinerDiv.appendChild(studnetTitle);
    
    studentNames.forEach(function(name) {
        let nameDiv = document.createElement("div");
        nameDiv.innerHTML = name;
        nameDiv.setAttribute("val", name);
        nameDiv.onclick = function() { simpleClick_setValue(this) };
        nameDiv.className = "unselectedName";
        
        conteinerDiv.appendChild(nameDiv);
    });
}


function create_missingPersonsTable (missingPersonData) {
    let tableBodyElemet = document.getElementById("missingPersons").getElementsByTagName("tbody")[0];
    tableBodyElemet.innerHTML = "Posodablanje tabele ...";

    let newTbody = document.createElement("tbody");

    let maxWorkerCount = 0;
    let maxStudentCount = 0;

    for (let index = 1; index < 8; index++) { 
        if (missingPersonData.workers[index].length > maxWorkerCount) {
            maxWorkerCount = missingPersonData.workers[index].length;
        }
        if (missingPersonData.students[index].length > maxStudentCount) {
            maxStudentCount = missingPersonData.students[index].length;
        }
    }

    // izpišemo redno zaposlene
    // newTbody.innerHTML += "<tr><th>Redno zaposleni:</th></tr>";
    for (let rowIndex = 0; rowIndex < maxWorkerCount; rowIndex++) {
        let rowEl = document.createElement("tr");

        for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
            let tdEl = document.createElement("td");
            if (missingPersonData.workers[dayIndex][rowIndex]) {
                const tempName = missingPersonData.workers[dayIndex][rowIndex];
                tdEl.innerHTML = tempName;
                
                if (tempName !== "") {
                    const zapId = data.zaposleni[tempName.toLowerCase()].zapID;
                    tdEl.setAttribute("zapolenId", zapId);
                }

                
            }
            rowEl.appendChild(tdEl);
        }
        newTbody.appendChild(rowEl);
    }

    newTbody.innerHTML += "<tr><th>Študentje:</th></tr>";
    // izpišemo študente
    for (let rowIndex = 0; rowIndex < maxStudentCount; rowIndex++) {
        let rowEl = document.createElement("tr");

        for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
            let tdEl = document.createElement("td");
            if (missingPersonData.students[dayIndex][rowIndex]) {
                const tempName = missingPersonData.students[dayIndex][rowIndex];
                tdEl.innerHTML = tempName;
                if (tempName !== "") {
                    const zapId = data.zaposleni[tempName.toLowerCase()].zapID;
                    tdEl.setAttribute("zapolenId", zapId);
                }
            }
            rowEl.appendChild(tdEl);
        }
        newTbody.appendChild(rowEl);
    }

    tableBodyElemet.innerHTML = newTbody.innerHTML;

    let allCellElements = document.querySelectorAll("#missingPersons td[zapolenId]");
    
    for (let i = 0; i < allCellElements.length; i++) {
        let cell = allCellElements[i];
        cell.onmouseover = function () {
            let allCells = document.querySelectorAll("#missingPersons td[zapolenId = '" + this.getAttribute("zapolenId") + "']")
            // allCells.forEach(function(nameCell) {
            for (let c = 0; c < allCells.length; c++) {
                let nameCell = allCells[c];
                nameCell.style.backgroundColor = "rgb(190, 190, 190)";
            }
        }
        cell.onmouseout = function () {
            let allCells = document.querySelectorAll("#missingPersons td[zapolenId = '" + this.getAttribute("zapolenId") + "']")
            // allCells.forEach(function(nameCell) {
            for (let c = 0; c < allCells.length; c++) {
                let nameCell = allCells[c];
                nameCell.style.backgroundColor = "transparent";
            }
        }
    }
    
}


function create_table_hoursAndSundayByWorker (weekData, sundayData, zaposleniData) {
    let tableBody = document.getElementById("hoursByWorker").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";
    
    const names = Object.keys(zaposleniData).sort();

    names.forEach(function(name) {
        let tableRowData = [];
        // tableRowData.push(zaposleniData[name].prikazanoImeZap);
        let weekMinutes = 0;
        let workingThisSunday = false;

        // pridobimo ure v tednu
        if (typeof(weekData[name]) !== "undefined") {
            for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
                let dayMinutes = 0;
                
                for (let i = 0; i < weekData[name][dayIndex].length; i++) {
                    const cell = weekData[name][dayIndex][i];
                    if (isSpecialOddelek(cell)) continue;

                    if (dayIndex === 7) {
                        workingThisSunday = true;
                    }
                    dayMinutes += get_timeDifference_inMinutes_betweenTwoTimes(cell.startTime, cell.endTime);
                }
                tableRowData.push(parseInt(dayMinutes/60).toString());
                weekMinutes += dayMinutes;
            }
        }
        else {
            for (let i = 0; i < 7; i++) {
                tableRowData.push("0");
            }
        }
        tableRowData.push(parseInt(weekMinutes/60).toString());

        let workerSundayDataExists = false;
        if (sundayData !== null) {
            if(typeof(sundayData[name]) !== "undefined") {
                workerSundayDataExists = true;

                let monthSundays = sundayData[name].monthSundays;
                let yearSundays = sundayData[name].monthSundays;

                monthSundays = workingThisSunday ? monthSundays + 1 : monthSundays;
                yearSundays = workingThisSunday ? yearSundays + 1 : yearSundays;

                tableRowData.push(monthSundays.toString());
                tableRowData.push(yearSundays.toString());
            }
        }

        if (!workerSundayDataExists) {
            if (workingThisSunday) {
                tableRowData.push("1");
                tableRowData.push("1");
            }
            else {
                tableRowData.push("0");
                tableRowData.push("0");
            }
        }

        // vpišemo v tabelo
        let htmlText = "<tr><th>" + zaposleniData[name].prikazanoImeZap + "</th>";
        for (let i = 0; i < tableRowData.length; i++) {
            htmlText += "<td>" + tableRowData[i] + "</td>";
        }
        htmlText += "</tr>";
        tableBody.innerHTML += htmlText;
    });
}