

// nastavi običajne čase oddelka če so te prazni, oz jih pobriše če odstranimo ime
function onChange_setUsualTimesForOddelek (inp_txt, startTime, endTime) {
    let inp_txt_position = inp_txt.getAttribute("position");
    let smena = inp_txt.getAttribute("smena");
    
    let inp_startTime = document.querySelectorAll("input.startTime[position='" + inp_txt_position + 
        "'][smena='" + smena + "']")[0];
    let inp_endTime = document.querySelectorAll("input.endTime[position='" + inp_txt_position + 
        "'][smena='" + smena + "']")[0];
        
    if (inp_txt.value == "" || inp_txt.value.substring(0,1) == "*") {
        inp_startTime.value = ""
        inp_endTime.value = ""
    } else if (inp_txt.value != ""){
        if (inp_startTime.value == "") {
            inp_startTime.value = startTime;
        }
        if (inp_endTime.value == "") {
            inp_endTime.value = endTime;
        }
    }
}