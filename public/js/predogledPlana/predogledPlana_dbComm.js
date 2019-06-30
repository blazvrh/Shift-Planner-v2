
// pridobimo podatke o izbranem tednu
function submitForm_get_trenuenPlan() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/urediTrenutenPlan/get");
    xhr.responseType = 'json';

    xhr.onload = function(event) {
        let serverRes = event.target.response;
        if (isIE()) {
            serverRes = JSON.parse(serverRes);
        }
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
           // če je error zaradi nobenega vnosa
           if (serverRes.weekData == null) {
               // ni podatka za ta teden; pošljemo prazen objekt
               create_table_selectedWeek({}, {}, {}, document.getElementById("planDelaIzbranTedenDiv"));
            }
            // če je kak drugačen error
            else {
                document.getElementById("planDelaIzbranTedenDiv").innerHTML = serverRes.msg;
                console.log(serverRes.msg);
            }
            return;
        }
        else {
            create_table_selectedWeek(JSON.parse(serverRes.weekData.weekData), serverRes.weekData.oddelkiDop, 
                serverRes.weekData.oddelkiPop, document.getElementById("planDelaIzbranTedenDiv"));

        }
    }; 

    var formData = new FormData ();

    formData.append("poslovalnica", userData.poslovalnica);
    formData.append("weekNum", currDateData.selectedWeekNumber);
    formData.append("year", currDateData.selectedMondayDate.getFullYear());
    
    xhr.send(formData);
}