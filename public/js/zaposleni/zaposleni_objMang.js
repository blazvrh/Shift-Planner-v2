
var vsiOddelki_names = [];

// ustvari tabelo checkboxov za oddelke
function create_checkBox_usposobljenost_zaposleni (vsiOddelki) {
    let seznamUsposobljenosti = document.getElementById("seznamUsposobljenosti");
    seznamUsposobljenosti.innerHTML = "";

    
    if (vsiOddelki == null) {
        seznamUsposobljenosti.innerHTML =  "Ni oddelkov, ki potrebujejo usposobljenost! <br> Pojdite na zavihek \"" +
        "<a href='oddelki.html'>Urejanje oddelkov</a>\" in ustvarite primerne oddelke.";
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
        "Študent", "Študent, mlajši od 16 let"];

    for (let i = 0; i < vsiOddelki_names.length; i++) {
        headerTexts.push (vsiOddelki_names[i]);
    }
    headerTexts.push ("Urejanje:");
    headerTexts.push ("Brisanje:");

    for (let i = 0; i < headerTexts.length; i++) {
        let thEl = document.createElement("th");
        
        // ustvarimo tooltip
        if (i > 6 && i < (headerTexts.length - 2) && headerTexts[i].length > 2) {
            thEl.innerText = headerTexts[i].substring(0, 2) + "..";
            thEl.setAttribute("class", "tooltip");
            let span = document.createElement("span");
            span.setAttribute("class", "tooltiptext");
            span.innerText = headerTexts[i];
            thEl.append(span);
        } else {
            thEl.innerText = headerTexts[i];
        }

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
    tdTexts = tdTexts.concat(convert_ToTextArray_usposobljenostZaposlenega(singleZaposlenData.usposobljenostZap));

    // za styling
    var tooltipTexts = ["Študent", "Študent, mlajši od 16 let"];
    tooltipTexts = tooltipTexts.concat(vsiOddelki_names);

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
        // dodamo tooltip za da/ne elemente
        if (i > 6) {
            tdEl.setAttribute("class", "tooltip "+ tdTexts[i]); // dodamo še class "Da"/"Ne" za styling
            let span = document.createElement("span");
            span.setAttribute("class", "tooltiptext");
            span.innerText = tooltipTexts[i-7];
            tdEl.append(span);
        }
        // dodamo class atribute za styling
        if (i > 2 && i < 7) {
            if (lowValue_stylig[i-3] == "Ne") {
                tdEl.setAttribute("class", "Ne");
            }
        }


        trElement.append (tdEl);
    }

    trElement.append(create_editBtn_tableZaposleni(singleZaposlenData.zapID));
    trElement.append(create_removeBtn_tableZaposleni(singleZaposlenData.zapID));

    trElement.setAttribute("zapid", singleZaposlenData.zapID);
    return trElement;
}

// ustvari text array z "Da" ali "Ne" za usposobljenost zaposlenega
function convert_ToTextArray_usposobljenostZaposlenega(usposobljenost) {
    usposobljenostTxtArr = [];
    
    for (let i = 0; i < vsiOddelki_names.length; i++) {
        jeUsposobljen = usposobljenost[vsiOddelki_names[i].toLowerCase()];

        if (!jeUsposobljen) {
            jeUsposobljen = false;
        }
        usposobljenostTxtArr.push(jeUsposobljen ? "Da" : "Ne");
    }

    return usposobljenostTxtArr;
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