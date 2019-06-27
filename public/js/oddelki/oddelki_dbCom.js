
// pridobi podatke o oddelkih
function submitForm_oddelekGet() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/get"); 
    xhr.responseType = 'json';

    xhr.onload=function(event){ 
        var serverRes = event.target.response;
        
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
            var dopOddleki = [];
            var popOddleki = [];
            var maxDopIndex = 0;
            var maxPopIndex = 0;
            serverRes.vsiOddelki.forEach(element => {
                if (element.smena == "dopoldne") {
                    dopOddleki.push(element);
                    if(element.positionForUser > maxDopIndex) maxDopIndex = element.positionForUser;
                } else if (element.smena == "popoldne") {
                    popOddleki.push(element);
                    if(element.positionForUser > maxPopIndex) maxPopIndex = element.positionForUser;
                }
            });
            sessionStorage.setItem ("oddelki_dopoldne", JSON.stringify(dopOddleki));
            sessionStorage.setItem ("oddelki_popoldne", JSON.stringify(popOddleki));
            
            maxIndexes.maxIndex_dopoldne = maxDopIndex;
            maxIndexes.maxIndex_popoldne = maxPopIndex;
            
            updateTableOddelki(serverRes.vsiOddelki.sort((a, b) => (a.positionForUser > b.positionForUser) ? 1 : -1));
        }
    }; 

    var formData = new FormData ();

    formData.append("poslovalnica", userData.poslovalnica);
    onTableMsgOddelki("Nalaganje ...");
    xhr.send(formData);
}

// vstavi nove podatek v tabelo
function submitForm_oddelekAdd() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/add"); 
    xhr.responseType = 'json';

    xhr.onload=function(event){ 
        var serverRes = event.target.response;
        
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            onInputErrorOddelki(serverRes.msg);
            return;
        }
        // drugače počisti polja in posodobi tabelo
        else {
            clearInputValues();
            document.getElementById("imeOddelka").focus();
            submitForm_oddelekGet();
        }
    }; 

    var formData = new FormData (document.getElementById("addOddelekForm"));

    formData.append("poslovalnica", userData.poslovalnica);
    var smena = document.getElementById("smenaOddelka").value;
    formData.append("positionForUser", maxIndexes["maxIndex_" + smena] + 1);
    
    xhr.send(formData);
}

// odstrani oddelek
function submitForm_oddelekRemove(oddelekId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/remove"); 
    xhr.responseType = 'json';

    xhr.onload=function(event){ 
        var serverRes = event.target.response;
        
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

    formData.append("oddelekId", oddelekId);
    formData.append("poslovalnica", userData.poslovalnica);
    
    xhr.send(formData);
}

// posodobi oddelek
function submitForm_oddelekUpdate(updateData) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/update"); 
    xhr.responseType = 'json';

    xhr.onload=function(event){ 
        var serverRes = event.target.response;
        
        
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

    formData.append("oddID", updateData.oddID);
    formData.append("poslovalnica", userData.poslovalnica);
    formData.append("imeOddelka", updateData.imeOddEdit.value);
    formData.append("stVrsticOddelka", updateData.stVrsticEdit.value);
    formData.append("prihod", updateData.prihodEdit.value);
    formData.append("odhod", updateData.odhodEdit.value);
    formData.append("specialOddelek", updateData.posebnostEdit.value);
    formData.append("positionForUser", updateData.positionForUser.value);
    
    formData.append("maxIndexes", JSON.stringify(maxIndexes));

    xhr.send(formData);
}