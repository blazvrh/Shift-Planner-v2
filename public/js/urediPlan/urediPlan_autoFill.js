
var timeValOnFocus = "";

// nastavi običajne čase oddelka če so te prazni, oz jih pobriše če odstranimo ime
// on name input blur
function onBlur_name_setUsualTimesForOddelek (inp_txt, startTime, endTime) {
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
    
    // seštejemo in prikažemo seštevek ur v tednu
    // let currWeekData = get_currPlan_Worker_dayOriented(get_currPlan_data_workerOriented());
    // sumAndShow_sestevekUr(currWeekData);
}

// nastavi običajne čase oddelka če so te prazni, oz jih pobriše če odstranimo ime
// on time input blur
function onBlur_time_setUsualTimesForOddelek (inp_timeEl, startTime, endTime) {
    let position = inp_timeEl.getAttribute("position");
    let smena = inp_timeEl.getAttribute("smena");
    
    let txt_input = document.querySelector("input[type='text'][position='" + position + 
        "'][smena='" + smena + "']");

    if (txt_input.value != "" && txt_input.value.substring(0,1) != "*" && inp_timeEl.value === "") {
        let timeType = inp_timeEl.className;

        if(timeType === "startTime") {
            inp_timeEl.value = startTime;
        } else if (timeType === "endTime") {
            inp_timeEl.value = endTime;
        }
    } else if (txt_input.value === "" || txt_input.value.substring(0,1) === "*") {
        inp_timeEl.value = "";
    }

    if (inp_timeEl.value !== timeValOnFocus) {
        onDataChange();
    }
    // seštejemo in prikažemo seštevek ur v tednu
    // let currWeekData = get_currPlan_Worker_dayOriented(get_currPlan_data_workerOriented());
    // sumAndShow_sestevekUr(currWeekData);
}

function onDataChange () {
    let imageElements = document.getElementsByClassName("doneIndicator");

    for (let i = 0; i < imageElements.length; i++) {
        img = imageElements[i];
        img.src = "images/krizec.png";
    }
}