
// ustvari novo tableo s podanim datumom
function btn_createCurrTable () {
    buttonElements.btn_showWeek.disabled = true;

    var tableZaPlan = document.getElementById("tableZaPlan");
    tableZaPlan.style.display = "none";
    error_onTableShow("");

    currDateData.workingWeekNumber = currDateData.selectedWeekNumber;
    currDateData.workingMondayDate = currDateData.selectedMondayDate;

    var mainTableDiv = document.getElementById("creationTable");
    mainTableDiv.innerHTML = "";
    
    tableElement = document.createElement("table");
    tableElement.append(ustvariHeader());
    
    pripniSmenoZaGalvnoTabelo("dopoldne", tableElement);
    pripniSmenoZaGalvnoTabelo("popoldne", tableElement);
    
    tableElement.setAttribute("id", "mainTable");
    
    mainTableDiv.append(tableElement);

    allDataCellElements = document.querySelectorAll("#mainTable td[position]");
    
    create_simpleClickWorkers(data.zaposleni);

    submitForm_get_trenuenPlan();
}

// Ustvari header tabele za ustvarjanje plana
function ustvariHeader () {
    var tempDate = new Date (currDateData.selectedMondayDate);
    var leto = tempDate.getFullYear();

    var tHeader = document.createElement("thead");
    var rowHeader = document.createElement("tr");

    var imenaDnevov = ["Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota", "Nedelja"];

    for (var i = 0; i < 8; i++) {
        var subTable = document.createElement("table");

        // če je to prva vrsta
        if (i == 0) {
            var thData = document.createElement("th");
            thData.innerText = leto + " Teden: " + currDateData.selectedWeekNumber;
            subTable.append(thData);
        }
        // če je to vrsta s tednom
        else {
            var thDataDay = document.createElement("th");
            thDataDay.innerText = imenaDnevov[i-1];
            
            var thDataDate = document.createElement("th");
            var currDatum = new Date(tempDate).toLocaleString('sl-SI',{day: "numeric", month: "long"});

            thDataDate.innerText = currDatum;
            tempDate.setDate(tempDate.getDate() + 1);

            subTable.append(thDataDay);
            subTable.append(thDataDate);
        }
        var tdHead = document.createElement("td");
        tdHead.append(subTable);
        rowHeader.append(tdHead);
    }

    tHeader.append(rowHeader);

    var praznikiRow = document.createElement("tr");

    for (var i = 0; i < 8; i++) {
        var cell = document.createElement("td");
        if (i > 0) {
            cell.innerHTML = "Praznik?";
        }
        praznikiRow.append(cell);
    }

    tHeader.append(praznikiRow);

    return tHeader;
}

// doda celotno smeno (dop/pop) v tabelo
function pripniSmenoZaGalvnoTabelo (smena, mainTable) {
    var smenaData = data["oddelki_" + smena];

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
                        inputElem_name.onblur = function() {
                        onBlur_name_setUsualTimesForOddelek(this, smenaData[oddNum].prihod, 
                            smenaData[oddNum].odhod)
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
                    var warnIndex = document.createElement("div");
                    warnIndex.setAttribute("fullPosition", xPos + "," + yPos + "," + smena);
                    warnIndex.setAttribute("indexType", "warning");
                    warnIndex.classList.add("hide");
                    // warnIndex.innerHTML = "<p>12</p>"
                    
                    var errIndex = document.createElement("div");
                    errIndex.setAttribute("fullPosition", xPos + "," + yPos + "," + smena);
                    errIndex.setAttribute("indexType", "error");
                    errIndex.classList.add("hide");
                    // errIndex.innerHTML = "<p>3</p>"

                    var errorIndexContenier = document.createElement("div");
                    errorIndexContenier.className = "errWarnIndexConteiner";
                    errorIndexContenier.append(warnIndex);
                    errorIndexContenier.append(errIndex);
                    // dodamo v celico za ime in v pod-tabelo
                    var tdNameInp = document.createElement("td");
                    // tdNameInp.append(warnIndex);
                    // tdNameInp.append(errIndex);

                    
                    var rowError = document.createElement("tr");
                    var rowData = document.createElement("tr");


                    tdNameInp.append(errorIndexContenier);
                    tdNameInp.append(inputElem_name);
                    subTable.append(tdNameInp);

                    // če ni SPECIAL oddelek
                    if (smenaData[oddNum].specialOddelek == "") {
                        var inputElemTime = [document.createElement("input"), document.createElement("input")];
                        var tdHourInp = document.createElement("td");
                        
                        for (var i = 0; i < inputElemTime.length; i++) {
                            var element = inputElemTime[i];
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

                            // auto fill on blur za time
                            element.onblur = function() {
                                onBlur_time_setUsualTimesForOddelek(this, smenaData[oddNum].prihod, 
                                    smenaData[oddNum].odhod)
                            };

                            element.onfocus = function() { timeValOnFocus = this.value };
                            // element.setAttribute ("oddelekId", smenaData[oddNum].oddID);

                            tdHourInp.append(element);
                        }

                        subTable.append(tdHourInp);
                    }
                    // če je SPECIAL oddelek
                    else {
                        var specType = smenaData[oddNum].specialOddelek == "Komentar" ? "komentar" : "dopustiBoln";
                        
                        inputElem_name.setAttribute ("class", inputElem_name.getAttribute ("class") + 
                            " specialOddelek " + specType);
                    }
                    
                    // tooltip ...
                    cell.classList.add("tooltip");

                    // za pozicijo tooltipa
                    var posDiv = document.createElement("div"); 
                    posDiv.classList.add("tooltipPos");
                    
                    var toolTipTextDiv = document.createElement("div");
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


function create_simpleClickWorkers(zaposleniData) {
    var conteinerDiv = document.getElementById("simpleClickNames");
    conteinerDiv.innerHTML = "";
    
    var allNames = Object.keys(zaposleniData).sort();

    var studentNames = [];

    allNames.forEach(name => {
        var originalName = zaposleniData[name].prikazanoImeZap;
        if (zaposleniData[name].student !== 0) {
            studentNames.push(originalName);
            return;
        }
        var nameDiv = document.createElement("div");
        nameDiv.innerHTML = originalName;
        nameDiv.setAttribute("val", originalName);
        nameDiv.onclick = function() { simpleClick_setValue(this) };
        nameDiv.className = "unselectedName";
        
        conteinerDiv.append(nameDiv);
    });

    // ustvarimo študente
    var studnetTitle = document.createElement("p");
    studnetTitle.innerText = "Študenti:";
    conteinerDiv.append(studnetTitle);
    
    studentNames.forEach(name => {
        var nameDiv = document.createElement("div");
        nameDiv.innerHTML = name;
        nameDiv.setAttribute("val", name);
        nameDiv.onclick = function() { simpleClick_setValue(this) };
        nameDiv.className = "unselectedName";
        
        conteinerDiv.append(nameDiv);
    });
}


function create_missingPersonsTable (missingPersonData) {
    var tableBodyElemet = document.getElementById("missingPersons").getElementsByTagName("tbody")[0];
    tableBodyElemet.innerHTML = "Posodablanje tabele ...";

    var newTbody = document.createElement("tbody");

    var maxWorkerCount = 0;
    var maxStudentCount = 0;

    for (var index = 1; index < 8; index++) { 
        if (missingPersonData.workers[index].length > maxWorkerCount) {
            maxWorkerCount = missingPersonData.workers[index].length;
        }
        if (missingPersonData.students[index].length > maxStudentCount) {
            maxStudentCount = missingPersonData.students[index].length;
        }
    }

    // izpišemo redno zaposlene
    // newTbody.innerHTML += "<tr><th>Redno zaposleni:</th></tr>";
    for (var rowIndex = 0; rowIndex < maxWorkerCount; rowIndex++) {
        var rowEl = document.createElement("tr");

        for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
            var tdEl = document.createElement("td");
            if (missingPersonData.workers[dayIndex][rowIndex]) {
                var tempName = missingPersonData.workers[dayIndex][rowIndex];
                tdEl.innerHTML = tempName;
                
                if (tempName !== "") {
                    var zapId = data.zaposleni[tempName.toLowerCase()].zapID;
                    tdEl.setAttribute("zapolenId", zapId);
                }

                
            }
            rowEl.append(tdEl);
        }
        newTbody.append(rowEl);
    }

    newTbody.innerHTML += "<tr><th>Študentje:</th></tr>";
    // izpišemo študente
    for (var rowIndex = 0; rowIndex < maxStudentCount; rowIndex++) {
        var rowEl = document.createElement("tr");

        for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
            var tdEl = document.createElement("td");
            if (missingPersonData.students[dayIndex][rowIndex]) {
                var tempName = missingPersonData.students[dayIndex][rowIndex];
                tdEl.innerHTML = tempName;
                if (tempName !== "") {
                    var zapId = data.zaposleni[tempName.toLowerCase()].zapID;
                    tdEl.setAttribute("zapolenId", zapId);
                }
            }
            rowEl.append(tdEl);
        }
        newTbody.append(rowEl);
    }

    tableBodyElemet.innerHTML = newTbody.innerHTML;

    var allCellElements = document.querySelectorAll("#missingPersons td[zapolenId]");
    
    for (var i = 0; i < allCellElements.length; i++) {
        var cell = allCellElements[i];
        cell.onmouseover = function () {
            var allCells = document.querySelectorAll("#missingPersons td[zapolenId = '" + this.getAttribute("zapolenId") + "']")
            allCells.forEach(nameCell => {
                nameCell.style.backgroundColor = "rgb(190, 190, 190)";
            });
        }
        cell.onmouseout = function () {
            var allCells = document.querySelectorAll("#missingPersons td[zapolenId = '" + this.getAttribute("zapolenId") + "']")
            allCells.forEach(nameCell => {
                nameCell.style.backgroundColor = "initial";
            });
        }
    }
    
}


function create_table_hoursAndSundayByWorker (weekData, sundayData, zaposleniData) {
    var tableBody = document.getElementById("hoursByWorker").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";
    
    var names = Object.keys(zaposleniData).sort();

    names.forEach(name => {
        var tableRowData = [];
        // tableRowData.push(zaposleniData[name].prikazanoImeZap);
        var weekMinutes = 0;
        var workingThisSunday = false;

        // pridobimo ure v tednu
        if (typeof(weekData[name]) !== "undefined") {
            for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
                var dayMinutes = 0;
                
                for (var i = 0; i < weekData[name][dayIndex].length; i++) {
                    var cell = weekData[name][dayIndex][i];
                    if (isSpecialOddelek(cell)) continue;

                    if (dayIndex === 7) {
                        workingThisSunday = true;
                    }
                    dayMinutes += get_timeDifference_inMinutes_betweenTwoTimes(cell.startTime, cell.endTime);
                }
                tableRowData.push(Number.parseInt(dayMinutes/60).toString());
                weekMinutes += dayMinutes;
            }
        }
        else {
            for (var i = 0; i < 7; i++) {
                tableRowData.push("0");
            }
        }
        tableRowData.push(Number.parseInt(weekMinutes/60).toString());

        var workerSundayDataExists = false;
        if (sundayData !== null) {
            if(typeof(sundayData[name]) !== "undefined") {
                workerSundayDataExists = true;

                var monthSundays = sundayData[name].monthSundays;
                var yearSundays = sundayData[name].monthSundays;

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
        var htmlText = "<tr><th>" + zaposleniData[name].prikazanoImeZap + "</th>";
        for (var i = 0; i < tableRowData.length; i++) {
            htmlText += "<td>" + tableRowData[i] + "</td>";
        }
        htmlText += "</tr>";
        tableBody.innerHTML += htmlText;
    });
}