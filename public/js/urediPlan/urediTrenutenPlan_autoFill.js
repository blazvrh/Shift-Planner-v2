

// nastavi običajne čase oddelka če so te prazni, oz jih pobriše če odstranimo ime
function onChange_setUsualTimesForOddelek (inp_txt, startTime, endTime) {
    inp_txt_id = inp_txt.id;
    inp_txt_value = inp_txt.value;
    
    let splitedId = inp_txt_id.split("_");
    let smena = splitedId[2];
    let inp_Index = splitedId[3];
    
    let inp_startTime = document.getElementById("start_inp_time_" + smena + "_" + inp_Index);
    let inp_endTime = document.getElementById("end_inp_time_" + smena + "_" + inp_Index);

    if (inp_txt_value == "" || inp_txt_value.substring(0,2) == "**") {
        inp_startTime.value = ""
        inp_endTime.value = ""
    } else if (inp_txt_value != ""){
        if (inp_startTime.value == "") {
            inp_startTime.value = startTime;
        }
        if (inp_endTime.value == "") {
            inp_endTime.value = endTime;
        }
    }
}