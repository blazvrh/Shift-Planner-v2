
var vsiOddelki_names = [];

function create_checkBox_usposobljenost_zaposleni (vsiOddelki) {
    let seznamUsposobljenosti = document.getElementById("seznamUsposobljenosti");
    seznamUsposobljenosti.innerHTML = "";

    vsiOddelki_names = get_PrimerneOddelke(vsiOddelki)
    
    if (vsiOddelki_names.length < 1) {
        seznamUsposobljenosti.innerHTML =  "Ni oddelkov, ki potrebujejo usposobljenost! <br> Pojdite na zavihek \"" +
        "<a href='oddelki.html'>Urejanje oddelkov</a>\" in ustvarite primerne oddelke.";
    } else {
        console.log(vsiOddelki_names);
        seznamUsposobljenosti.append(create_usposobljenostElement(vsiOddelki_names));

    }
}

// pridobi oddleke za katere je potrebna usposobljenost
function get_PrimerneOddelke(vsiOddelki) {

    oddelkiNames = [];

    vsiOddelki.forEach(element => {
        oddName = element.imeOddelka;
        specialOdd = element.specialOddelek;
        if (specialOdd == "" && !oddelkiNames.includes(oddName)) {
            oddelkiNames.push(oddName);
        }
    });

    return oddelkiNames;
}

function create_usposobljenostElement (vsiOddelki_names) {
    let mainEl = document.createElement("div");

    vsiOddelki_names.forEach(element => {
        let label = document.createElement("label");
        let chkbox = document.createElement("input");
        
        chkbox.setAttribute("type", "checkbox")
        label.appendChild(chkbox);
        label.innerHTML += element + "<br>";

        mainEl.appendChild(label);
    });

    return mainEl;
}