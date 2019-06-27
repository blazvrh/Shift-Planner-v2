
var vsiOddelki_names = [];

// ustvari tabelo checkboxov za oddelke
function create_checkBox_usposobljenost_zaposleni (vsiOddelki) {
    var seznamUsposobljenosti = document.getElementById("seznamUsposobljenosti");
    seznamUsposobljenosti.innerHTML = "";

    
    if (vsiOddelki == null) {
        seznamUsposobljenosti.innerHTML =  "Ni oddelkov, ki potrebujejo usposobljenost! <br> Pojdite na zavihek \"" +
        "<a href='oddelki'>Urejanje oddelkov</a>\" in ustvarite primerne oddelke.";
    } else {
        vsiOddelki_names = get_PrimerneOddelke(vsiOddelki);
        seznamUsposobljenosti.append(create_usposobljenostElement(vsiOddelki_names));
    }
}

// izris tabele vseh obstoječih zaposlenih
function create_table_osebe_zaposleni(vsiZaposleni) {
    var seznamZaposlenihDiv = document.getElementById("seznamZaposlenihDiv");
    seznamZaposlenihDiv.innerHTML = "";
    
    if (vsiZaposleni == null) {
        seznamZaposlenihDiv.innerText = "Ni najdenega vnosa zaposlenih!";
    } else {
        var tableZaposlenih = document.createElement("table");
        tableZaposlenih.append(create_TableHead_SeznamZaposlenih());
        tableZaposlenih.append(create_TableBody_SeznamZaposlenih(vsiZaposleni));

        seznamZaposlenihDiv.append(tableZaposlenih);
    }
}

// pridobi oddleke za katere je potrebna usposobljenost
function get_PrimerneOddelke(vsiOddelki) {
    oddelkiNames = [];
    oddelkiNamesLowerCase = []; // ta je da sledimo če je uporabnik vnesel oddelek z različnimi črkami, vseeno pa rabimo samo en izpis

    vsiOddelki.forEach(element => {
        oddName = element.imeOddelka;
        specialOdd = element.specialOddelek;
        if (specialOdd == "" && !oddelkiNamesLowerCase.includes(oddName.toLowerCase())) {
            oddelkiNames.push(oddName);
            oddelkiNamesLowerCase.push(oddName.toLowerCase());
        }
    });

    return oddelkiNames;
}

// ustvari element checkboxov (div) za usposobljenost
function create_usposobljenostElement (vsiOddelki_names) {
    var mainEl = document.createElement("div");

    vsiOddelki_names.forEach(element => {
        var label = document.createElement("label");
        var chkbox = document.createElement("input");
        
        chkbox.setAttribute("type", "checkbox")
        chkbox.setAttribute("value", element.toLowerCase());
        label.appendChild(chkbox);
        label.innerHTML += element;
        
        var pEl = document.createElement("p");
        pEl.append(label);

        mainEl.appendChild(pEl);
    });

    return mainEl;
}

// ustvari header za tabelo obstoječih zaposlenih
function create_TableHead_SeznamZaposlenih () {
    var trEl = document.createElement("tr");

    var headerTexts = ["Prik. ime", "Ime", "Priimek", "Ur/dan", "Ur/teden", "Nedelje", "Prazniki", 
        "Študent", "Mlajši od 18 let", "Usposobljenost"];

    headerTexts.push ("Urejanje");
    headerTexts.push ("Brisanje");

    for (var i = 0; i < headerTexts.length; i++) {
        var thEl = document.createElement("th");
        
        thEl.innerText = headerTexts[i];

        trEl.append (thEl);
    }

    var tHead = document.createElement("thead");
    tHead.append(trEl);
    return tHead;
}

// ustvari body tabele obstoječih zaposlenih
function create_TableBody_SeznamZaposlenih (vsiZaposleni) {
    var tBodyZap = document.createElement("tbody");

    for (var i = 0; i < vsiZaposleni.length; i++) {
        tBodyZap.append(create_tableRow_seznamZaposlenih(vsiZaposleni[i]))
    }

    return tBodyZap;
}

// ustvari vrstico za tabelo obstoječih zaposlenih (enega zaposlenega)
function create_tableRow_seznamZaposlenih (singleZaposlenData) {
    trElement = document.createElement("tr");

    tdTexts = [];
    tdIds = ["text","text","text","number","number","number","number"]
    
    tdTexts.push(singleZaposlenData.prikazanoImeZap);
    tdTexts.push(singleZaposlenData.imeZap);
    tdTexts.push(singleZaposlenData.priimekZap);
    tdTexts.push(singleZaposlenData.maxUrDanZap);
    tdTexts.push(singleZaposlenData.maxUrTedenZap);
    tdTexts.push(singleZaposlenData.maxNedelijZap);
    tdTexts.push(singleZaposlenData.maxPraznikovZap);
    tdTexts.push(singleZaposlenData.student == 1 ? "Da" : "Ne");
    tdTexts.push(singleZaposlenData.studentMlajsi == 1 ? "Da" : "Ne");
    
    // tdTexts = tdTexts.concat(convert_ToTextArray_usposobljenostZaposlenega(singleZaposlenData.usposobljenostZap));

    var lowValue_stylig =[];
    lowValue_stylig.push(Number.parseInt(singleZaposlenData.maxUrDanZap) < 8 ? "Ne" : "");
    lowValue_stylig.push(Number.parseInt(singleZaposlenData.maxUrTedenZap) < 40 ? "Ne" : "");
    lowValue_stylig.push(Number.parseInt(singleZaposlenData.maxNedelijZap) < 1 ? "Ne" : "");
    lowValue_stylig.push(Number.parseInt(singleZaposlenData.maxPraznikovZap) < 1 ? "Ne" : "");

    for (var i = 0; i < tdTexts.length; i++) {
        var tdEl = document.createElement("td");
        tdEl.innerText = tdTexts[i];
        if (i < tdIds.length) {
            tdEl.setAttribute("id", tdIds[i]);
        } else {
            tdEl.setAttribute("id", "select");
        }

        // dodamo class atribute za styling
        if (i > 2 && i < 7) {
            if (lowValue_stylig[i-3] == "Ne") {
                tdEl.setAttribute("class", "Ne");
            }
        } else if (i > 6 && i < 9) {
            tdTexts[i]== "Da" ? tdEl.setAttribute("class", tdTexts[i] = "Da") : false;
        }

        trElement.append (tdEl);
    }

    trElement.append(create_usposobljenost_element_ZaTabelo(singleZaposlenData.usposobljenostZap));
    trElement.append(create_editBtn_tableZaposleni(singleZaposlenData.zapID));
    trElement.append(create_removeBtn_tableZaposleni(singleZaposlenData.zapID));

    trElement.setAttribute("zapid", singleZaposlenData.zapID);
    return trElement;
}

// ustvari usposobljenost za tabelo prikaza zaposlenih
function create_usposobljenost_element_ZaTabelo (usposobljenost) {
    tdEl = document.createElement("td");

    for (var i = 0; i < vsiOddelki_names.length; i++) {
        jeUsposobljen = usposobljenost[vsiOddelki_names[i].toLowerCase()];
        
        var oddUspEl = document.createElement("span");
        oddUspEl.innerText = vsiOddelki_names[i];

        if (jeUsposobljen == true) {
            oddUspEl.setAttribute("class", "jeUsposobljen");
        } else {
            oddUspEl.setAttribute("class", "niUsposobljen");
        }

        tdEl.setAttribute("id", "span");

        tdEl.append(oddUspEl);
    }

    return tdEl;
}

// ustvari edit gumb za tabelo
function create_editBtn_tableZaposleni(zapId) {
    tdEl = document.createElement("td");
    btnEl = document.createElement("button");

    btnEl.setAttribute("value", zapId);
    btnEl.setAttribute("class", "editBtn");
    btnEl.setAttribute("onclick", "btn_odpriUrediZaposlenega(this.value)");
    
    btnEl.innerText = "Uredi!";
    
    tdEl.setAttribute("id", "editBtn");
    tdEl.append(btnEl);
    return tdEl;
}

// ustvari remove gumb za tabelo
function create_removeBtn_tableZaposleni(zapId) {
    tdEl = document.createElement("td");
    btnEl = document.createElement("button");
    
    btnEl.setAttribute("value", zapId);
    btnEl.setAttribute("class", "btnRemoveOdd");
    btnEl.setAttribute("onclick", "btn_removeZaposleniFromDb(this.value)");
    
    btnEl.innerText = "Odstrani!";
    
    tdEl.setAttribute("id", "removeBtn");
    tdEl.append(btnEl);
    return tdEl;
}


// spremeni vrstico v format za urejanje zaposlenega
function createEditRow_zaposleni (zapId) {
    
    var tableRowObj = document.querySelector('[zapid="' + zapId + '"]');
    originalTableRow = tableRowObj.innerHTML;
    // za validation; da lahko ignoriramo če se prikazano ime ni spremenilo
    currentPrikazanoIme = tableRowObj.getElementsByTagName("td")[0].innerText;

    var editingTd = tableRowObj.getElementsByTagName("td");
    
    for (var i = 0; i < editingTd.length; i++) {
        var tdID = editingTd[i].id;
        
        // ustvarimo select polja
        if (tdID == "select") {
            var inputElement = document.createElement("select");
            inputElement.setAttribute("type", tdID);

            var option1 = document.createElement("option");
            option1.value = true;
            option1.text = "Da";
            var option2 = document.createElement("option");
            option2.value = false;
            option2.text = "Ne";

            inputElement.appendChild(option1);
            inputElement.appendChild(option2);
            
            var selectVal = editingTd[i].innerText == "Da" ? true : false;
            inputElement.value = selectVal;
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        }
        // ustvarimo urejanje za usposobljenost
        else if (tdID == "span") {
            var oddelkiUspos = editingTd[i].getElementsByTagName("span");
            var inputElement = document.createElement("div");
            
            for (var j = 0; j < oddelkiUspos.length; j++) {
                var labelUsp = document.createElement("label");
                
                labelUsp.innerText = oddelkiUspos[j].innerText;
                labelUsp.setAttribute("value", oddelkiUspos[j].classList.contains("jeUsposobljen"));
                labelUsp.setAttribute("class", oddelkiUspos[j].className);
                labelUsp.setAttribute("id", oddelkiUspos[j].innerText + "_edit");

                labelUsp.onclick = function() { toggle_usposobljenostZaposlenega_edit(this) };

                inputElement.append(labelUsp);
            }
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        }
        // ustvarimo potrdi gumb
        else if (tdID == "removeBtn") {
            var inputElement = document.createElement("button");
            inputElement.innerText = "Potrdi!";
            inputElement.onclick = () => {btn_confirmEdit_zaposleni(zapId, inputElement)};
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        } 
        // ustvarimo prekliči gumb
        else if (tdID == "editBtn") {
            var inputElement = document.createElement("button");
            inputElement.innerText = "Prekliči!";
            inputElement.onclick = () => { btn_cancelEdit_zaposleni(zapId) };
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        } 
        // ustvarimo preostale input elemente
        else if (tdID != "") {
            var inputElement = document.createElement("input");
            inputElement.setAttribute("type", tdID);
            inputElement.value = editingTd[i].innerText;
            if (tdID == "number") {
                if (i == 3) {
                    inputElement.setAttribute("min", "1");
                    inputElement.setAttribute("max", "24");
                } else if (i == 4) {
                    inputElement.setAttribute("min", "1");
                    inputElement.setAttribute("max", "168");
                } else {
                    inputElement.setAttribute("min", "0");
                    inputElement.setAttribute("max", "356");
                }
            } else if (tdID == "text") {
                if (i == 0) {
                    inputElement.setAttribute("maxlength", "12");
                } else {
                    inputElement.setAttribute("maxlength", "20");
                }
            }
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        }
    }
}

// spremni vrednost za usposobljenost za posamezen oddelek pri zaposoenemu 
function toggle_usposobljenostZaposlenega_edit (el) {
    var val = el.getAttribute("value");

    if (val == "true") {
        el.setAttribute("value", false);
        el.setAttribute("class", "niUsposobljen");
    } else {
        el.setAttribute("value", true);
        el.setAttribute("class", "jeUsposobljen");
    }
}

function create_table_zaposleniPoOddelkih (zaposleniData) {
    var mainDivElement = document.getElementById("PodatkiPoOddelkihData");
    if (typeof(zaposleniData) === "undefined") {
        mainDivElement.innerHTML = "Ni najdenega vnosa zaposlenih!";
        return; 
    }

    var zaposleniPoOddelkihData = get_zapNamesByOdd(zaposleniData);

    // table 
    var tableElement = document.createElement("table");
    // table header
    var tHead = document.createElement("thead");
    var headRow = document.createElement("tr");

    vsiOddelki_names.forEach(oddelekName => {
        var thElement = document.createElement("th");
        thElement.innerHTML = oddelekName;
        headRow.append(thElement);
    });
    
    tHead.append(headRow);
    tableElement.append(tHead);
    
    // pridobimo potrebno število vrstic
    var numOfRows = 0;
    for (var i = 0; i < vsiOddelki_names.length; i++) {
        if (zaposleniPoOddelkihData[vsiOddelki_names[i]].length > numOfRows) {
            numOfRows = zaposleniPoOddelkihData[vsiOddelki_names[i]].length;
        }
    }

    // vpišemo zaposlene
    var tableBody = document.createElement("tbody");
    for (var i = 0; i < numOfRows; i++) {
        var row = document.createElement("tr");

        for (var j = 0; j < vsiOddelki_names.length; j++) {
            var cell = document.createElement("td");
            if (typeof(zaposleniPoOddelkihData[vsiOddelki_names[j]][i]) !== "undefined") {
                var zapData = zaposleniPoOddelkihData[vsiOddelki_names[j]][i];
                cell.innerHTML = zapData.name;
                cell.setAttribute("zapolenId", zapData.id);

                cell.onmouseover = function () {
                    var allCells = document.querySelectorAll("#PodatkiPoOddelkihData td[zapolenId = '" + this.getAttribute("zapolenId") + "']")
                    allCells.forEach(nameCell => {
                        nameCell.style.backgroundColor = "rgb(190, 190, 190)";
                    });
                }
                cell.onmouseout = function () {
                    var allCells = document.querySelectorAll("#PodatkiPoOddelkihData td[zapolenId = '" + this.getAttribute("zapolenId") + "']")
                    allCells.forEach(nameCell => {
                        nameCell.style.backgroundColor = "initial";
                    });
                }
            }
            row.append(cell);
        }
        tableBody.append(row);
    }
    tableElement.append(tableBody);
    
    mainDivElement.innerHTML = "";
    mainDivElement.append(tableElement);
}


function get_zapNamesByOdd (zapData) {
    var sortedData = { }
    for (var i = 0; i < vsiOddelki_names.length; i++) {
        sortedData[vsiOddelki_names[i]] = [];
    }

    for (var i = 0; i < zapData.length; i++) {
        var singleZapUsposobljenost = zapData[i].usposobljenostZap;
        
        for (var j = 0; j < vsiOddelki_names.length; j++) {
            var oddName = vsiOddelki_names[j];
            if (singleZapUsposobljenost[oddName.toLowerCase()]) {
                sortedData[oddName].push({ 
                    name: zapData[i].prikazanoImeZap,
                    id: zapData[i].zapID
                })
            }
        }
    }

    return sortedData;
}