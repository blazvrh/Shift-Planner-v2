
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
            let dopData = serverRes.weekData.oddelkiDop;
            let popData = serverRes.weekData.oddelkiPop;

            // remove " on the start and end if there is one
            if (dopData[0] === "\"") {
                dopData = dopData.substr(1);
            }
            if (dopData[dopData.length - 1] === "\"") {
                dopData = dopData.substring(0, dopData.length - 1);
            }
            if (popData[0] === "\"") {
                popData = popData.substr(1);
            }
            if (popData[popData.length - 1] === "\"") {
                popData = popData.substring(0, popData.length - 1);
            }
            


            try {
                dopData = JSON.parse(dopData);
                popData = JSON.parse(popData);
            } catch (error) {
                console.log(error);
                
            }

            // create_table_selectedWeek(JSON.parse(serverRes.weekData.weekData), serverRes.weekData.oddelkiDop, 
            //     serverRes.weekData.oddelkiPop, document.getElementById("planDelaIzbranTedenDiv"));
            create_table_selectedWeek(JSON.parse(serverRes.weekData.weekData), dopData, 
                popData, document.getElementById("planDelaIzbranTedenDiv"));
                
        }
    }; 

    var formData = new FormData ();

    formData.append("poslovalnica", userData.poslovalnica);
    formData.append("weekNum", currDateData.selectedWeekNumber);
    formData.append("year", currDateData.selectedMondayDate.getFullYear());
    
    xhr.send(formData);
}