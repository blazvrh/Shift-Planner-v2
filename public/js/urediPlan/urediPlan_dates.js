

var currDateData = { };

var inp_izberiDatum = document.getElementById("inp_izberiDatum");
var txt_stTedna = document.getElementById("txt_stTedna");


// gumb za skakanje po tednu za eno gor/dol
function btn_changeWeekByOne (mulitplier) {
    var datum = new Date(inp_izberiDatum.value);
    datum.setDate(datum.getDate() + (7 * mulitplier));
    inp_izberiDatum.value = convertDateToString(datum);
    izberiCelotenTeden(datum);
}


// iz podanega datuma poišče ponedljek in nedeljo ter št. tedna
function izberiCelotenTeden (date) {

    var inp_tedenZacetek = document.getElementById("datum_zacetek");
    var inp_tedenKonec = document.getElementById("datum_konec");

    let currDate = new Date();
    if (date) {
        currDate = new Date(date);
    }
    else {
        inp_izberiDatum.value = convertDateToString(currDate);
    }
    
    let dayOfWeek = currDate.getDay();
    if (dayOfWeek == 0) dayOfWeek = 6;
    
    let weekNumber = get_weekNumber_fromDate(currDate);
    
    let zacetekDate = new Date(currDate);
    zacetekDate.setDate(zacetekDate.getDate() - dayOfWeek + 1);
    let konecDate = new Date(currDate);
    konecDate.setDate(konecDate.getDate() + (7 - dayOfWeek));

    zacetekDateString = new Date(zacetekDate).toLocaleString('sl-SI',{day: "numeric", month: "long", year: "numeric"});
    konecDateString = new Date(konecDate).toLocaleString('sl-SI',{day: "numeric", month: "long", year: "numeric"});
    
    inp_tedenZacetek.innerText = zacetekDateString;
    inp_tedenKonec.innerText = konecDateString;
    txt_stTedna.innerText = weekNumber;

    currDateData.selectedWeekNumber = weekNumber;
    currDateData.selectedMondayDate = zacetekDate;
}

// pretvori datum v string ki ga lahko izpišemo v input[type="date"]
function convertDateToString(date) {
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();

    let dateString = [yyyy.toString(), "-",
        (mm > 9 ? '' : '0') + mm.toString(), "-",
        (dd > 9 ? '' : '0') + dd.toString()
    ].join('');
    
    return dateString;
}

// pridobi številko tedna za določen datum
function get_weekNumber_fromDate (date) { 
    // nastavimo na nedeljo tega tedna; uro damo na 1
    let sundayDate = new Date(date);
    sundayDate.setDate(sundayDate.getDate() + 6 - get_dayOfWeek_fromDate(sundayDate));
    sundayDate.setHours(1);
    
    // pridobimo leto te nedelje
    let year = sundayDate.getFullYear();
    
    // pridobimo datum prve nedelje v letu
    let firstSundayDate = new Date(year, 0, 4);
    firstSundayDate.setDate(firstSundayDate.getDate() + 6 - get_dayOfWeek_fromDate(firstSundayDate));
    firstSundayDate.setHours(1);

    // pogledmo koliko dni je med prvo nedljo in nedeljo trenutnega tedna
    let daysDifference = Math.ceil((sundayDate - firstSundayDate) / (1000 * 60 * 60 * 24));

    // if stavek ker nočem deliti 0 / 7
    let weekNumber;
    if (daysDifference == 0) {
        weekNumber = 1;
    } else {
        weekNumber = (daysDifference / 7) + 1;
    }
    return weekNumber;
}

// pridobi dan v tednu kot intiger; 0=pon, 6=ned
function get_dayOfWeek_fromDate (date) {
    // odštejemo 1 da je ponedeljek 0 in nedelje -1
    let dayOfWeek = new Date(date).getDay() - 1;
    // ker želimo nedeljo 6, ne -1
    if (dayOfWeek < 0) {
        dayOfWeek += 7;
    }
    return dayOfWeek;
}

// pridobimo datum dneva v tednu s katerim delamo na planu
function get_DateOfweekDay (dayNum) {
    let newDate = new Date(currDateData.workingMondayDate);
    newDate.setDate(newDate.getDate() + dayNum);

    return convertDateToString(newDate);
}

// primerja 2 časa; če je čas 1 večji od časa 2 vrne true
function compare_times_is_time1_greaterThan_time2 (time1, time2, time1InNextDay) {
    if (time1InNextDay == null) time1InNextDay = false;

    let time1_splited = time1.split(":");
    let time2_splited = time2.split(":");

    let day1 = time1InNextDay ? 2 : 1;

    let date1 = new Date(2000,1,day1);
    date1.setHours(time1_splited[0], time1_splited[1], 0);
    let date2 = new Date(2000,1,1);
    date2.setHours(time2_splited[0], time2_splited[1], 0);
    
    if (date1 > date2) {
        return true;
    } else {
        return false;
    }
}

// primerja če je to že naslednji dan
function check_is_time2inNextDay (time1, time2) {

    let time1_splited = time1.split(":");
    let time2_splited = time2.split(":");

    let date1 = new Date(2000,1,1);
    date1.setHours(time1_splited[0], time1_splited[1], 0)
    let date2 = new Date(2000,1,1);
    date2.setHours(time2_splited[0], time2_splited[1], 0)
    
    if (date1 > date2) {
        return true;
    } else {
        return false;
    }
}

// izračunamo razliko dveh časov v minutah
function get_timeDifference_inMinutes_betweenTwoTimes (timeStart, timeEnd) {

    let time1_splited = timeStart.split(":");
    let time2_splited = timeEnd.split(":");

    let day2 = check_is_time2inNextDay(timeStart, timeEnd) ? 2 : 1;

    let date1 = new Date(2000, 1, 1);
    date1.setHours(time1_splited[0], time1_splited[1], 0)
    let date2 = new Date(2000, 1, day2);
    date2.setHours(time2_splited[0], time2_splited[1], 0)
    
    let timeDiffMin = (date2 - date1) / 1000 / 60;

    return timeDiffMin;
}
