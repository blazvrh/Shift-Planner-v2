
// pridobi podatke o oddelkih
function submitForm_oddelekGet() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/get"); 

    xhr.onload=function(event){ 
        let serverRes = JSON.parse(event.target.response);
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            console.log(serverRes.msg);
            onTableMsgOddelki(serverRes.msg);
            return;
        }
        else if (serverRes.vsiOddelki < 1) {
            onTableMsgOddelki("Ni vnosa za oddelek!");
            return;
        }
        // drugače prikaži oddelke
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

            updateTableOddelki(serverRes.vsiOddelki);
        }
    }; 

    var formData = new FormData ();

    formData.set("poslovalnica", userData.poslovalnica);
    onTableMsgOddelki("Nalaganje ...");
    xhr.send(formData);
}

// vstavi nove podatek v tabelo
function submitForm_oddelekAdd() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/add"); 

    xhr.onload=function(event){ 
        let serverRes = JSON.parse(event.target.response);
        
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            onInputErrorOddelki(serverRes.msg);
            return;
        }
        // drugače počisti polja in posodobi tabelo
        else {
            clearInputValues();
            submitForm_oddelekGet();
        }
    }; 

    var formData = new FormData (document.getElementById("addOddelekForm"));

    formData.set("poslovalnica", userData.poslovalnica);
    xhr.send(formData);
}

// odstrani oddelek
function submitForm_oddelekRemove(oddelekId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/remove"); 

    xhr.onload=function(event){ 
        let serverRes = JSON.parse(event.target.response);
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            onTableErrorOddelki(serverRes.msg);
            return;
        }
        // drugače posodobi tabelo
        else {
            submitForm_oddelekGet();
        }
    }; 

    var formData = new FormData ();

    formData.set("oddelekId", oddelekId);
    formData.set("poslovalnica", userData.poslovalnica);
    
    xhr.send(formData);
}

// posodobi oddelek
function submitForm_oddelekUpdate(updateData) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/update"); 

    xhr.onload=function(event){ 
        let serverRes = JSON.parse(event.target.response);
        
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            onTableErrorOddelki(serverRes.msg);
            return;
        }
        // drugače posodobi tabelo
        else {
            openRowId = "";
            originalTableRow = "";
            submitForm_oddelekGet();
        }
    }; 

    var formData = new FormData ();

    formData.set("oddID", updateData.oddID);
    formData.set("poslovalnica", userData.poslovalnica);
    formData.set("imeOddelka", updateData.imeOddEdit.value);
    formData.set("stVrsticOddelka", updateData.stVrsticEdit.value);
    formData.set("prihod", updateData.prihodEdit.value);
    formData.set("odhod", updateData.odhodEdit.value);
    formData.set("specialOddelek", updateData.posebnostEdit.value);

    xhr.send(formData);
}

// da takoj izrišemo tabelo ko se stran odpre
if(userData) {
    submitForm_oddelekGet();
}