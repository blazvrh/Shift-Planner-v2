
// pridobimo podatke o oddelkih
function submitForm_oddelekGet() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/get");
    xhr.responseType = 'json';

    xhr.onload = function(event) {
        let serverRes = event.target.response;
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // če je error zaradi nobenega vnosa
            if (serverRes.vsiOddelki == null) {
                console.log("Ni oddelkov; Pohandlaj!!");
                
            }
            // če je kak drugačen error
            else {
                console.log(serverRes.msg);
                console.log("Pohandlaj error");

                // documentObjects_zaposleni.zaposleniInputError.innerText = serverRes.msg;
            }
            return;
        }
        else {
            // shranimo v storage
            let dopOddleki = [];
            let popOddleki = []
            serverRes.vsiOddelki.forEach(element => {
                if (element.smena == "dopoldne") {
                    dopOddleki.push(element);
                } else if (element.smena == "popoldne") {
                    popOddleki.push(element);
                }
            });
            sessionStorage.setItem ("oddelki_dopoldne", JSON.stringify(dopOddleki));
            sessionStorage.setItem ("oddelki_popoldne", JSON.stringify(popOddleki));

        }
        submitForm_zaposleniGet();
    }; 
    var formData = new FormData ();

    formData.set("poslovalnica", userData.poslovalnica);
    xhr.send(formData);
}

// pridobimo podatke o zaposlenih
function submitForm_zaposleniGet() {
    var xhrGetZaposlene = new XMLHttpRequest();
    xhrGetZaposlene.open("POST", "/zaposleni/get");
    xhrGetZaposlene.responseType = 'json';

    xhrGetZaposlene.onload=function(event){ 
        let serverRes = event.target.response;
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // če je error zaradi nobenega vnosa
            if (serverRes.vsiZaposleni == null) {
                console.log("Ni oddelkov; Pohandlaj!!");
            }
            // če je kak drugačen error
            else {
                console.log(serverRes.msg);
                console.log("IZPIŠI ERROR UPORABNIKU");
            }
            return;
        }
        else {
            // pridobimo vsa prikazana imena
            let prikazanaImena = [];
            serverRes.vsiZaposleni.forEach(element => {
                prikazanaImena.push(element.prikazanoImeZap);
            });
            
            // shranimo v storage
            sessionStorage.setItem ("zaposleni", JSON.stringify(serverRes.vsiZaposleni));

            showMainPageContent(prikazanaImena);
        }
    }; 

    var formData = new FormData ();

    formData.set("poslovalnica", userData.poslovalnica);
    xhrGetZaposlene.send(formData);
}