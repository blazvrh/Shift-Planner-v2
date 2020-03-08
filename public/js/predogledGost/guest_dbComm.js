
// pridobimo podatke o trenutnem tednu
function submitForm_get_weekData(mondayDate, year, weekIdentifier) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/urediTrenutenPlan/get");
    xhr.responseType = 'json';

    const weekNum = get_weekNumber_fromDate(mondayDate);

    xhr.onload = function (event) {
        let serverRes = event.target.response;
        if (isIE()) {
            serverRes = JSON.parse(serverRes);
        }

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



            create_table_selectedWeek(JSON.parse(serverRes.weekData.weekData), dopData,
                popData, divElement, {
                mondayDate: mondayDate,
                weekNum: weekNum
            });
            // create_table_selectedWeek(JSON.parse(serverRes.weekData.weekData), serverRes.weekData.oddelkiDop, 
            //     serverRes.weekData.oddelkiPop, divElement, {
            //         mondayDate: mondayDate,
            //         weekNum: weekNum
            //     });

        }

    };

    var formData = new FormData();
    formData.append("poslovalnica", imePoslovalnice);
    formData.append("weekNum", weekNum);
    formData.append("year", year);

    xhr.send(formData);
}