
var vsiOddelki_names = [];

// ustvari tabelo checkboxov za oddelke
function create_checkBox_usposobljenost_zaposleni (vsiOddelki) {
    let seznamUsposobljenosti = document.getElementById("seznamUsposobljenosti");
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
    let seznamZaposlenihDiv = document.getElementById("seznamZaposlenihDiv");
    seznamZaposlenihDiv.innerHTML = "";
    
    if (vsiZaposleni == null) {
        seznamZaposlenihDiv.innerText = "Ni najdenega vnosa zaposlenih!";
    } else {
        let tableZaposlenih = document.createElement("table");
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
    let mainEl = document.createElement("div");

    vsiOddelki_names.forEach(element => {
        let label = document.createElement("label");
        let chkbox = document.createElement("input");
        
        chkbox.setAttribute("type", "checkbox")
        chkbox.setAttribute("value", element.toLowerCase());
        label.appendChild(chkbox);
        label.innerHTML += element;
        
        let pEl = document.createElement("p");
        pEl.append(label);

        mainEl.appendChild(pEl);
    });

    return mainEl;
}

// ustvari header za tabelo obstoječih zaposlenih
function create_TableHead_SeznamZaposlenih () {
    let trEl = document.createElement("tr");

    let headerTexts = ["Prik. ime", "Ime", "Priimek", "Ur/dan", "Ur/teden", "Nedelje", "Prazniki", 
        "Študent", "Mlajši od 16 let", "Usposobljenost"];

    headerTexts.push ("Urejanje");
    headerTexts.push ("Brisanje");

    for (let i = 0; i < headerTexts.length; i++) {
        let thEl = document.createElement("th");
        
        thEl.innerText = headerTexts[i];

        trEl.append (thEl);
    }

    let tHead = document.createElement("thead");
    tHead.append(trEl);
    return tHead;
}

// ustvari body tabele obstoječih zaposlenih
function create_TableBody_SeznamZaposlenih (vsiZaposleni) {
    let tBodyZap = document.createElement("tbody");

    for (let i = 0; i < vsiZaposleni.length; i++) {
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

    for (let i = 0; i < tdTexts.length; i++) {
        let tdEl = document.createElement("td");
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

    for (let i = 0; i < vsiOddelki_names.length; i++) {
        jeUsposobljen = usposobljenost[vsiOddelki_names[i].toLowerCase()];
        
        let oddUspEl = document.createElement("span");
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
    
    let tableRowObj = document.querySelector('[zapid="' + zapId + '"]');
    originalTableRow = tableRowObj.innerHTML;
    // za validation; da lahko ignoriramo če se prikazano ime ni spremenilo
    currentPrikazanoIme = tableRowObj.getElementsByTagName("td")[0].innerText;

    let editingTd = tableRowObj.getElementsByTagName("td");
    
    for (let i = 0; i < editingTd.length; i++) {
        let tdID = editingTd[i].id;
        
        // ustvarimo select polja
        if (tdID == "select") {
            let inputElement = document.createElement("select");
            inputElement.setAttribute("type", tdID);

            let option1 = document.createElement("option");
            option1.value = true;
            option1.text = "Da";
            let option2 = document.createElement("option");
            option2.value = false;
            option2.text = "Ne";

            inputElement.appendChild(option1);
            inputElement.appendChild(option2);
            
            let selectVal = editingTd[i].innerText == "Da" ? true : false;
            inputElement.value = selectVal;
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        }
        // ustvarimo urejanje za usposobljenost
        else if (tdID == "span") {
            let oddelkiUspos = editingTd[i].getElementsByTagName("span");
            let inputElement = document.createElement("div");
            
            for (let j = 0; j < oddelkiUspos.length; j++) {
                let labelUsp = document.createElement("label");
                
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
            let inputElement = document.createElement("button");
            inputElement.innerText = "Potrdi!";
            inputElement.onclick = () => {btn_confirmEdit_zaposleni(zapId)};
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        } 
        // ustvarimo prekliči gumb
        else if (tdID == "editBtn") {
            let inputElement = document.createElement("button");
            inputElement.innerText = "Prekliči!";
            inputElement.onclick = () => { btn_cancelEdit_zaposleni(zapId) };
            editingTd[i].innerHTML = "";
            editingTd[i].append(inputElement);
        } 
        // ustvarimo preostale input elemente
        else if (tdID != "") {
            let inputElement = document.createElement("input");
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
    let val = el.getAttribute("value");

    if (val == "true") {
        el.setAttribute("value", false);
        el.setAttribute("class", "niUsposobljen");
    } else {
        el.setAttribute("value", true);
        el.setAttribute("class", "jeUsposobljen");
    }
}