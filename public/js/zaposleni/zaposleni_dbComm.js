
// pridobi podatke o oddelkih
function submitForm_oddelekGet() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/get"); 

    xhr.onload=function(event){ 
        let serverRes = JSON.parse(event.target.response);
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            console.log(serverRes.msg);
            // onTableMsgOddelki(serverRes.msg);
            return;
        }
        // else if (serverRes.vsiOddelki < 1) {
        //     // onTableMsgOddelki("Ni vnosa za oddelek!");
        //     return;
        // }
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
            create_checkBox_usposobljenost_zaposleni(serverRes.vsiOddelki);
        }
    }; 

    var formData = new FormData ();

    formData.set("poslovalnica", userData.poslovalnica);
    xhr.send(formData);
}