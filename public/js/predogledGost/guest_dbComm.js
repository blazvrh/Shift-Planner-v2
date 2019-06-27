
// pridobimo podatke o trenutnem tednu
function submitForm_get_weekData(mondayDate, year, weekIdentifier) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/urediTrenutenPlan/get");
    xhr.responseType = 'json';

    const weekNum = get_weekNumber_fromDate(mondayDate);

    xhr.onload = function(event) {
        let serverRes = event.target.response;
        const divElement = document.getElementById("planDela_" + weekIdentifier + "_Div");
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
           // če je error zaradi nobenega vnosa
           if (serverRes.weekData == null) {
               // ni podatka za ta teden; pošljemo prazen objekt
               create_table_selectedWeek({}, {}, {}, divElement, {
                   mondayDate: mondayDate,
                   weekNum: weekNum
               });

                // submitForm_get_lastWeekPlan();
            }
            // če je kak drugačen error
            else {
                console.log(serverRes.msg);
                console.log("IZPIŠI ERROR UPORABNIKU");
            }
        }
        else {
            create_table_selectedWeek(JSON.parse(serverRes.weekData.weekData), serverRes.weekData.oddelkiDop, 
                serverRes.weekData.oddelkiPop, divElement, {
                    mondayDate: mondayDate,
                    weekNum: weekNum
                });
        }
        
    }; 
    
    var formData = new FormData ();
    formData.append("poslovalnica", imePoslovalnice);
    formData.append("weekNum", weekNum);
    formData.append("year", year);
    
    xhr.send(formData);
}