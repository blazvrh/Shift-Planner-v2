
var tablesDiv = document.getElementById("tablesDiv");

// izpiše msg za tabelo 
function onTableMsgOddelki (msg) {
    tablesDiv.innerHTML = "";
    var h4El = document.createElement("h4");
    h4El.innerText = msg;
    
    tablesDiv.appendChild(h4El);
}

// posodobi tabelo oddlkov
function updateTableOddelki (vsiOddelki) {
    tablesDiv.innerHTML = "<h4>Nalaganje ...</h4>";
    const TableDop = document.createElement("table");
    const TablePop = document.createElement("table");

    TableDop.appendChild(createHeaderRow());
    TablePop.appendChild(createHeaderRow());
    
    vsiOddelki.forEach(element => {
        newRow = createTableRow(element);
        if (element.smena == "dopoldne") {
            TableDop.append(newRow);
        }
        else if (element.smena == "popoldne") {
            TablePop.append(newRow);
        }
    });
    let tableErrorMsg = document.createElement("p");
    tableErrorMsg.setAttribute("class", "Error");
    tableErrorMsg.setAttribute("id", "tableErrorMsg");
    
    tablesDiv.innerHTML = "<h3>Dopoldne</h3>";
    tablesDiv.appendChild(TableDop);
    tablesDiv.appendChild(tableErrorMsg);
    tablesDiv.innerHTML += "<h3>Popoldne</h3>";
    tablesDiv.appendChild(TablePop);
}

// ustvari header za tabelo
function createHeaderRow () {
    trEl = document.createElement("tr");
    textElements = ["Položaj:", "Oddelek:", "Čas prihoda:", "Čas odhoda:", "Št. vrstic", "Posebnost:", "Urejanje:", "Brisanje!"]

    for (let i = 0; i < textElements.length; i++) {
        let thEl = document.createElement("th");
        thEl.innerText = textElements[i];
        trEl.appendChild(thEl);
    }
    return trEl;
}

// ustvari posamezno vrstico za tabelo
function createTableRow (rowData) {
    const tableDataTxts = [rowData.positionForUser, rowData.imeOddelka, rowData.prihod, rowData.odhod, rowData.stVrsticOddelka, 
        rowData.specialOddelek];
    const tableDataId = ["index", "text", "time", "time", "number", "select"]

    trEl = document.createElement("tr");
    trEl.setAttribute("id", String(rowData.oddID));
    for (let i = 0; i < tableDataTxts.length; i++) {
        let tdEl = document.createElement("td");
        tdEl.setAttribute("id", tableDataId[i])
        let txt = String(tableDataTxts[i]);
        if (txt == "") txt = "/";
        tdEl.innerText = txt;
        trEl.appendChild (tdEl);
    }

    // edit btn
    let tdEditBtnEl = document.createElement("td");
    tdEditBtnEl.setAttribute("id", "editBtn");

    btnEditEl = document.createElement("button");
    btnEditEl.setAttribute("value", rowData.oddID);
    btnEditEl.setAttribute("onclick", "btn_odpriUrediOddelek(this.value)");
    btnEditEl.innerText = "Uredi!";
    
    tdEditBtnEl.appendChild(btnEditEl);
    trEl.appendChild(tdEditBtnEl);

    // delete btn
    let tdRemoveBtnEl = document.createElement("td");
    tdRemoveBtnEl.setAttribute("id", "removeBtn");

    btnRemoveEl = document.createElement("button");
    btnRemoveEl.setAttribute("value", rowData.oddID);
    btnRemoveEl.setAttribute("class", "btnRemoveOdd");
    btnRemoveEl.setAttribute("onclick", "removeOddelekFromDb(this.value)");
    btnRemoveEl.innerText = "Odstrani!";
    
    tdRemoveBtnEl.appendChild(btnRemoveEl);
    trEl.appendChild(tdRemoveBtnEl);

    return trEl;
}

// ustvari vrstico za urejanje oddelka
function createEditRow_oddelki (oddelekId) {
    
    let tableRowObj = document.getElementById(oddelekId);
    originalTableRow = tableRowObj.innerHTML;

    let editingTd = tableRowObj.getElementsByTagName("td");

    for (let i = 0; i < editingTd.length; i++) {
        let tdID = editingTd[i].id;
        
        // ustvarimo posebnost oddelka
        if (tdID == "select") {
            let inputElement = document.createElement("select");
            inputElement.setAttribute("type", tdID);

            let option1 = document.createElement("option");
            option1.value = "";
            option1.text = "/";
            let option2 = document.createElement("option");
            option2.value = "Komentar";
            option2.text = "Komentar";
            let option3 = document.createElement("option");
            option3.value = "Oddelek brez delovnega časa";
            option3.text = "Oddelek brez delovnega časa";

            inputElement.appendChild(option1);
            inputElement.appendChild(option2);
            inputElement.appendChild(option3);
            
            let selectVal = editingTd[i].innerText;
            if (selectVal == "/") selectVal ="";
            inputElement.value = selectVal;
            inputElement.onchange = () => {onSpecialSelect(oddelekId)};
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        } 
        // ustvarimo potrdi gumb
        else if (tdID == "removeBtn") {
            let inputElement = document.createElement("button");
            inputElement.innerText = "Potrdi!";
            inputElement.onclick = function() {btn_confirmEdit(this, oddelekId)};
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        } 
        // ustvarimo prekliči gumb
        else if (tdID == "editBtn") {
            let inputElement = document.createElement("button");
            inputElement.innerText = "Prekliči!";
            inputElement.onclick = () => { btn_cancelEdit(oddelekId) };
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        } 
        else if (tdID === "index") {
            let inputElement = document.createElement("input");
            inputElement.setAttribute("type", "number");
            inputElement.value = editingTd[i].innerText;
            inputElement.setAttribute("min", "0");
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        }
        // ustvarimo preostale input elemente
        else if (tdID != "") {
            let inputElement = document.createElement("input");
            inputElement.value = editingTd[i].innerText;
            inputElement.setAttribute("type", tdID);
            if (tdID == "number") {
                inputElement.setAttribute("min", "1");
                inputElement.setAttribute("max", "20");
            } else if (tdID == "text") {
                inputElement.setAttribute("type", tdID);
                inputElement.setAttribute("maxlength", "20");
            } else if(tdID == "time") {
                inputElement.setAttribute("type", "text");
                add_liseners_toTextInputWithTime(inputElement);
                inputElement.classList.add("textTime");
                inputElement.setAttribute("onchange", "onTimeEnterEdit(" + oddelekId + ", this.value)");
            }
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        }
    }
    
}