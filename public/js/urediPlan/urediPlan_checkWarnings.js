
///
// preverimo če je zaposlen na seznamu vseh zaposlenih
///
function preveri_zaposlen_obstaja (weekData) {
    var names = Object.keys(weekData);

    names.forEach(name => {
        if(!(name in data.prikazanaImena)) {
            // da vpišemo vsa mesta kjer je ta oseba
            for (var i = 1; i < 8; i++) {
                weekData[name][i].forEach(cell => {
                    //če smo na komentarju -> preskoči
                    if (get_OddelekType(cell) === "Komentar") return;

                    var smena = cell.smena;
                    var pos = cell.position;
                    var wholePos = pos + "," + smena;
                    var originalName = cell.originalName;
                    
                    if (!allErrors.warnings[wholePos]) {
                        allErrors.warnings[wholePos] = [];
                    }

                    var warnMsg = " - Oseba <strong><em>" + originalName + "</em></strong> ni vnešena v seznam zaposlenih." +
                        " Za to osebo ne bo mogoče preveriti vseh pravil!"

                    allErrors.warnings[wholePos].push(warnMsg);
                });
            }   
        }
    });
}

///
// preveri če je zaposlen usposobljen za oddelek
///
function preveri_zaposlen_usposobljenost(weekData) {
    var names = Object.keys(weekData);

    names.forEach(name => {
        // če ime obstaja v naši bazi zaposlenih
        if (name in data.prikazanaImena) {
            // preveri za vsako celico
            for (var i = 1; i < 8; i++) {
                weekData[name][i].forEach(cell => {
                    // če smo na posebnem oddelku (komentar, dopusti ...) preskoči
                    if (isSpecialOddelek(cell)) return;

                    var oddelekName = cell.oddelekName;
                    var oddelekNameLowerCase = oddelekName.toLowerCase();
                    var usposobljenostZaposlenega = data.zaposleni[name].usposobljenostZap;
                    // če ni usposobljen dodaj warning
                    if (usposobljenostZaposlenega[oddelekNameLowerCase] == false) {
                        var warnMsg = " - Oseba <strong><em>" + data.zaposleni[name].prikazanoImeZap + 
                            "</em></strong> ni usposobljena za oddelek <strong><em>" 
                            + oddelekName + "</em></strong>!";

                        var smena = cell.smena;
                        var pos = cell.position;
                        var wholePos = pos + "," + smena;
                        
                        if (!allErrors.warnings[wholePos]) {
                            allErrors.warnings[wholePos] = [];
                        }
            
                        allErrors.warnings[wholePos].push(warnMsg);
                    }
                });
            }
        }
    });
}

///
// preveri če je oseba delala že prejšnjo nedeljo
///
function preveri_prejsnoNedeljo (prevWeekData, currWeekData) {
    // če ni podatka za prejšnji teden končaj
    if (prevWeekData === null || Object.keys(prevWeekData).length < 1) return;

    var warnNames = []; // imena ki so delala že prejšnjo nedeljo

    var nameKeys = Object.keys(currWeekData);
    nameKeys.forEach(name => {
        // nadaljuj samo če oseba dela v nedeljo v tem tednu
        if (currWeekData[name][7].length < 1) return;

        var dayData = currWeekData[name][7];
        
        for (var i = 0; i < dayData.length; i++) {
            if (isSpecialOddelek(dayData[i])) {
                continue;
            }

            try {
                var prevWeekDayData = prevWeekData[name][7];
                for (var j = 0; j < prevWeekDayData.length; j++) {
                    if (isSpecialOddelek(prevWeekDayData[i])) {
                        continue;
                    }
                    warnNames.push(name);
                    break;
                }
            } catch (err) {

            }
            break;
        }
    });

    warnNames.forEach(name => {
        var dayData = currWeekData[name][7];
        for (var i = 0; i < dayData.length; i++) {
            if (isSpecialOddelek(dayData[i])) {
                continue;
            }

            var wholePos = dayData[i].position + "," + dayData[i].smena;
            var originalName = "";
            if (data.zaposleni[name] != null) {
                originalName = data.zaposleni[name].prikazanoImeZap;
            } else {
                originalName = dayData[i].originalName;
            }

            var warnMsg = " - Oseba <strong><em>" + originalName + 
                "</em></strong> je delala že <strong><em>prejšnjo nedeljo</em></strong>!";

            if (!allErrors.warnings[wholePos]) {
                allErrors.warnings[wholePos] = [];
            }

            allErrors.warnings[wholePos].push(warnMsg);
        }
    });
}


///
// če je bil prejšnjo nedeljo prost, preveri če je tedenski počitek prisoten (35 prostih ur od sobote do ponedeljka)
///
function preveri_tedenskiPocitek_SobotaPonedeljek (prevWeekData, currWeekData) {
    // če ni podatka za prejšnji teden končaj
    if (prevWeekData === null || Object.keys(prevWeekData).length < 1) return;

    var currWeekNames = Object.keys(currWeekData);
    var prevWeekNames = Object.keys(prevWeekData);

    currWeekNames.forEach(name => {
        if (!(prevWeekNames.includes(name))) return;

        var sundayTime = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
        var maxEndTime = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][6]);
        var minStartTime = get_cell_minStartTime_forWorker_inDay(currWeekData[name][1]);

        if (sundayTime != null || maxEndTime === null || minStartTime === null) return;


        var endTimeInNextDay = check_is_time2inNextDay(maxEndTime.startTime, maxEndTime.endTime);
        var satTime = maxEndTime.endTime;
        var monTime = minStartTime.startTime;

        var timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(satTime, monTime);

        var saturdayTimeBigerThanMondayTime = compare_times_is_time1_greaterThan_time2(satTime, monTime)
        
        // če je sobotni čas v naslednjem dnevu && je manjši od ponedeljka // prištej 24 ur
        if (endTimeInNextDay && !saturdayTimeBigerThanMondayTime) {
            timeDiff += 24 * 60;
        } 
        // če sobotni čas ni v naslednjem dnevu && je večji od ponedeljka // prištej 24ur
        else if (!endTimeInNextDay && saturdayTimeBigerThanMondayTime) {
            timeDiff += 24 * 60
        }
        // če sobotni čas ni v naslednjem dnevu && je manjši od ponedeljka // prištej 48 ur
        else if (!endTimeInNextDay && !saturdayTimeBigerThanMondayTime) {
            timeDiff += 48 * 60;
        }
        // če je sobotni čas v naslednjem dnevu in je večji od ponedeljka // is good

        // shrani opozorilo če je potrebno
        if (timeDiff < (dnevniPocitek + 24) * 60) {
            var originalName = get_originalName(name, minStartTime);
            var pocitekTimeString = Number.parseInt(timeDiff / 60).toString() + " ur " + (timeDiff % 60).toString() + " min";
            var warnMsg = " - Počitek od sobote do ponedeljka za osebo <strong><em>" + originalName + "</em></strong>" +
                " ni dovolj dolg, da bi nedelja služila kot prost dan!" +
                "<br>&emsp;Zagotovljen počitek: <strong>" + pocitekTimeString + "</strong>" +
                "<br>&emsp;Potreben počitek: <strong>" + (dnevniPocitek + 24).toString() + " ur</strong>";

            insert_errorWarrning_tooltipMessage(warnMsg, get_fullPosition(minStartTime), "warnings");
        }
    });
}


// ///
// // preveri če ima oseba dodaten prost dan po delovni nedelji
// ///
// function preveri_prostDan_poDelovniNedelji (prevWeekData, currWeekData) {
//     // če ni podatka za prejšnji teden končaj
//     if (prevWeekData === null || Object.keys(prevWeekData).length < 1) return;

//     // ustvarimo array vseh delavcev ki so delali prejšnjo nedeljo
//     var prevSundayWorkers = [];
//     var prevWeekNames = Object.keys(prevWeekData);
//     prevWeekNames.forEach(name => {
//         for (var i = 0; i < prevWeekData[name][7].length; i++) {
//             var cell = prevWeekData[name][7][i];
//             if (isSpecialOddelek(cell)) {
//                 continue;
//             } else {
//                 prevSundayWorkers.push(name);
//             }
//         }
//     });
    
//     // za vsako osebo v tem tednu
//     var nameKeys = Object.keys(currWeekData);
//     nameKeys.forEach(name => {
//         // če oseba ni delala prejšnjo nedeljo jo preskoči
//         if (!(prevSundayWorkers.includes(name))) return;
        
//         var maxRestTime = 0;
//         var cellWithMaxRest = null;

//         var lastEndTimeCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
//         var endTimeInNextDay = check_is_time2inNextDay(lastEndTimeCell.startTime, lastEndTimeCell.endTime);
//         var lastEndTimeDayIndex = 0;
        
//         for (var dayIndex = 1; dayIndex < 7; dayIndex++) {
//             var currDayData = currWeekData[name][dayIndex];
//             var startTimeCell = get_cell_minStartTime_forWorker_inDay(currDayData);
            
//             if (startTimeCell != null) {
//                 // preračunamo razliko v času
//                 var restTime = get_timeDifference_inMinutes_betweenTwoTimes(lastEndTimeCell.endTime, startTimeCell.startTime);
//                 // prištejemo manjkajoče dneve
//                 var dayDiff = Number.parseInt(startTimeCell.dayIndex) - Number.parseInt(lastEndTimeDayIndex) - 1;
//                 restTime += dayDiff *24 *60;

//                 // če je končni čas kasneje kot začetni čas in je končni čas v naslednjem dnevu, odštej en dan
//                 if (endTimeInNextDay && compare_times_is_time1_greaterThan_time2(lastEndTimeCell.endTime, startTimeCell.startTime)) {
//                     restTime -= 24 * 60;
//                 }
//                 // če pa je končni čas pred začetnim in končni čas po polnoči prištej dan
//                 else if (!endTimeInNextDay && compare_times_is_time1_greaterThan_time2(startTimeCell.startTime, lastEndTimeCell.endTime)) {
//                     restTime += 24 * 60;
//                 }
                
//                 if (restTime > maxRestTime) {
//                     maxRestTime = restTime;
//                     cellWithMaxRest = startTimeCell;
//                 }
                
//                 lastEndTimeCell = get_cell_maxEndTime_forWorker_inDay(currDayData);
//                 endTimeInNextDay = check_is_time2inNextDay(lastEndTimeCell.startTime, lastEndTimeCell.endTime);
//                 lastEndTimeDayIndex = dayIndex;
//             }
//             if (dayIndex === 6 && startTimeCell === null) return;
//         }


//         // izpišemo error če je potrebno
//         if (maxRestTime < ((dnevniPocitek * 60) + (24 * 60))) {
//             var fullPosition = get_fullPosition(cellWithMaxRest);
//             var originalName = get_originalName(name, cellWithMaxRest);
//             var restTimeString = maxRestTime < 0 ? "- " : "";

//             var maxRestHous = Math.abs(Number.parseInt(maxRestTime / 60));
//             var maxRestMinutes = Math.abs(maxRestTime % 60);
//             restTimeString += maxRestHous.toString() + " ur " + maxRestMinutes.toString() + " min";
//             restTimeString += maxRestTime < 0 ? " (prekrivanje delovnega časa)" : "";

//             var warnMsg = " - Potreben dodaten <strong>prost dan</strong> po delovni nedelji za osebo <strong><em>" 
//                 + originalName + "</em></strong>?<br>" + 
//                 "&emsp;Maksimalni zagotovljeni počitek po oddelani nedelji: <strong>" + restTimeString + "</strong>"+
//                 "<br>&emsp;Poreben počitek za prost dan: <strong>" + (24 + dnevniPocitek).toString() + 
//                 " ur</strong>";

//             insert_errorWarrning_tooltipMessage(warnMsg, fullPosition, "warnings");
//         }
//     });
// }

///
// preveri če ima oseba zagotovljen tedenski počitek (če trenutna nedelja prosta preskočimo)
///
function preveri_tedenskiPocitek (currWeekData, prevWeekData) {
    // za vsako osebo v tem tednu
    var nameKeys = Object.keys(currWeekData);
    nameKeys.forEach(name => {
        var maxRestTime = 0;
        var cellWithMaxRest = null;

        var lastEndTimeCell = null;
        
        try {
            lastEndTimeCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
        } catch (e) {}
        
        var lastEndTimeDayIndex = 0;
        
        for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
            if (lastEndTimeCell === null) {
                if (dayIndex === 7) return;
                lastEndTimeCell = get_cell_maxEndTime_forWorker_inDay(currWeekData[name][dayIndex]);
                lastEndTimeDayIndex = dayIndex;
                continue;
            }

            var endTimeInNextDay = check_is_time2inNextDay(lastEndTimeCell.startTime, lastEndTimeCell.endTime);
            
            var currDayData = currWeekData[name][dayIndex];
            var startTimeCell = get_cell_minStartTime_forWorker_inDay(currDayData);
            
            if (startTimeCell != null) {
                // preračunamo razliko v času
                var restTime = get_timeDifference_inMinutes_betweenTwoTimes(lastEndTimeCell.endTime, startTimeCell.startTime);
                // prištejemo manjkajoče dneve
                var dayDiff = Number.parseInt(startTimeCell.dayIndex) - Number.parseInt(lastEndTimeDayIndex) - 1;
                restTime += dayDiff *24 *60;

                // če je končni čas kasneje kot začetni čas in je končni čas v naslednjem dnevu, odštej en dan
                if (endTimeInNextDay && compare_times_is_time1_greaterThan_time2(lastEndTimeCell.endTime, startTimeCell.startTime)) {
                    restTime -= 24 * 60;
                }
                // če pa je končni čas pred začetnim in končni čas po polnoči prištej dan
                else if (!endTimeInNextDay && compare_times_is_time1_greaterThan_time2(startTimeCell.startTime, lastEndTimeCell.endTime)) {
                    restTime += 24 * 60;
                }
                
                if (restTime > maxRestTime) {
                    maxRestTime = restTime;
                    cellWithMaxRest = startTimeCell;
                }
                
                lastEndTimeCell = get_cell_maxEndTime_forWorker_inDay(currDayData);
                endTimeInNextDay = check_is_time2inNextDay(lastEndTimeCell.startTime, lastEndTimeCell.endTime);
                lastEndTimeDayIndex = dayIndex;
            }
            if (dayIndex === 7 && startTimeCell === null) return;
        }

        // izpišemo error če je potrebno
        if (maxRestTime < ((dnevniPocitek * 60) + (24 * 60))) {
            var fullPosition = get_fullPosition(cellWithMaxRest);
            var originalName = get_originalName(name, cellWithMaxRest);
            var restTimeString = maxRestTime < 0 ? "- " : "";

            var maxRestHous = Math.abs(Number.parseInt(maxRestTime / 60));
            var maxRestMinutes = Math.abs(maxRestTime % 60);
            restTimeString += maxRestHous.toString() + " ur " + maxRestMinutes.toString() + " min";
            restTimeString += maxRestTime < 0 ? " (prekrivanje delovnega časa)" : "";

            var warnMsg = " - Oseba <strong><em>" + originalName + "</em></strong> " + 
                "nima zagotovljenega tedenskega počitka. V naslednjem tednu potrebna 2 prosta dneva!<br>" +
                "&emsp;Maksimalni zagotovljeni počitek v tem tednu: <strong>" + restTimeString + "</strong>"+
                "<br>&emsp;Poreben počitek za prost dan: <strong>" + (24 + dnevniPocitek).toString() + 
                " ur</strong>";

            insert_errorWarrning_tooltipMessage(warnMsg, fullPosition, "warnings");
        }
    });
}