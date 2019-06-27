
///
// preveri če obstaja prekrivanje časov v istem dnevu za osebo
///
function preveri_cas_prekrivanje (weekData) {
    var allNames = Object.keys(weekData);

    allNames.forEach(name => {
        for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
            var dayData = weekData[name][dayIndex];
            // če sta manj kot 2 vnosa, prekrivanje ni možno
            if (dayData.length < 2) continue;
            
            var dayCellErrors = [];
            // primerjamo končni čas vsakega elemeta z začetnim časom vsakega elementa
            // zadnjega ne rabimo več pregledovati ker smo ga primerjali že vsemi drugimi
            for (var i = 0; i < dayData.length - 1; i++) {
                var firstCell = dayData[i];
                if (isSpecialOddelek(firstCell)) continue;

                for (var j = i + 1; j < dayData.length; j++) {
                    var secondCell = dayData[j];
                    if (isSpecialOddelek(secondCell)) continue;

                    var cell1StartTime = firstCell.startTime;
                    var cell1EndTime = firstCell.endTime;
                    var cell2StartTime = secondCell.startTime;
                    var cell2EndTime = secondCell.endTime;
                    var cell1_inNextDay = check_is_time2inNextDay(cell1StartTime, cell1EndTime);
                    var cell2_inNextDay = check_is_time2inNextDay(cell2StartTime, cell2EndTime);
                    
                    // dodamo celico v array če je čas konca na prvem oddelku večji od časa pričetka na drugem oddelku
                    if (compare_times_is_time1_greaterThan_time2(cell1EndTime, cell2StartTime, cell1_inNextDay) &&
                        compare_times_is_time1_greaterThan_time2(cell2EndTime, cell1StartTime, cell2_inNextDay)) {
                        if (!(dayCellErrors.includes(firstCell))) {
                            dayCellErrors.push(firstCell);
                        }
                        if (!(dayCellErrors.includes(secondCell))) {
                            dayCellErrors.push(secondCell);
                        }
                    }
                }
            }
            // pogledamo na katerih oddelkih je prekrivanje in shranimo error
            var oddelkiSPrekrivanjemArr = [];
            var fullTooltipPositions = [];
            dayCellErrors.forEach(cellData => {
                var oddName = cellData.oddelekName + " (" + cellData.smena + ")";
                if (!(oddelkiSPrekrivanjemArr.includes(oddName))) {
                    oddelkiSPrekrivanjemArr.push(oddName);
                }
                fullTooltipPositions.push(cellData.position + "," + cellData.smena);
            });
            
            var prikazanoImeZap = ""
            if (data.zaposleni[name] != null) {
                prikazanoImeZap = data.zaposleni[name].prikazanoImeZap
            } else {
                prikazanoImeZap = name;
            }
            
            var errMsg = " - Zaznano prekrivanje delovnega časa za osebo <strong><em>" + prikazanoImeZap + 
            "</em></strong> na oddelkih: <strong><em>" + oddelkiSPrekrivanjemArr.join(", ") + "</em></strong>";
            
            fullTooltipPositions.forEach(fullPosition => {
                if (!allErrors.errors[fullPosition]) {
                    allErrors.errors[fullPosition] = [];
                }
    
                allErrors.errors[fullPosition].push(errMsg);
            });
        }
    });
}

///
// preveri dnevni in tedenski delovni čas
//
function preveri_maxCase (weekData) {
    var allNames = Object.keys(weekData);

    allNames.forEach(name => {
        if (!(name in data.prikazanaImena)) return;
        var tedenskiDelovniCas = 0;
        var dnevniDelovniCas = 0;
        var originalName = data.zaposleni[name].prikazanoImeZap;
        
        for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
            var dayData = weekData[name][dayIndex];
            dnevniDelovniCas = 0;
            for (var i = 0; i < dayData.length; i++) {
                var cellData = dayData[i];
                if (isSpecialOddelek(cellData)) continue;

                var startTime = cellData.startTime;
                var endTime = cellData.endTime;
                dnevniDelovniCas += get_timeDifference_inMinutes_betweenTwoTimes(startTime, endTime);
            }
            tedenskiDelovniCas += dnevniDelovniCas;

            // preverimo če je dnevni čas prekoračen            
            var maxDnevniCas = data.zaposleni[name].maxUrDanZap;
            
            if (dnevniDelovniCas > maxDnevniCas * 60) {
                var opravljeneUre = Number.parseInt(dnevniDelovniCas / 60);
                var opravljeneMinute = dnevniDelovniCas % 60;
                var opravljenCas = opravljeneUre.toString() + " ur";
                opravljenCas += opravljeneMinute > 0 ? " " + opravljeneMinute.toString() + " min" : "";

                var errMsg = " - Prekoračen dnevni delovni čas za osebo <strong><em>" + originalName + "</em></strong>!" +
                    "<br>&emsp;Opravil/-a: <strong>" + opravljenCas + "</strong>" +
                    "<br>&emsp;Dovoljeno: <strong>" + maxDnevniCas + " ur</strong>";

                for (var cellIndex = 0; cellIndex < dayData.length; cellIndex++) {
                    if (isSpecialOddelek(dayData[cellIndex])) continue;

                    var fullPosition = dayData[cellIndex].position + "," + dayData[cellIndex].smena;
                    if (!allErrors.errors[fullPosition]) {
                        allErrors.errors[fullPosition] = [];
                    }

                    allErrors.errors[fullPosition].push(errMsg);
                }
            }
        }

        // preverimo če je tedenski čas prekoračen  
        var maxTedenskiCas = data.zaposleni[name].maxUrTedenZap;
        
        if (tedenskiDelovniCas > maxTedenskiCas * 60) {
            var opravljeneUre = Number.parseInt(tedenskiDelovniCas / 60);
            var opravljeneMinute = tedenskiDelovniCas % 60;
            var opravljenCas = opravljeneUre.toString() + " ur";
            opravljenCas += opravljeneMinute > 0 ? " " + opravljeneMinute.toString() + " min" : "";

            var errMsg = " - Prekoračen tedenski delovni čas za osebo <strong><em>" + originalName + "</em></strong>!" +
                "<br>&emsp;Opravil/-a: <strong>" + opravljenCas + "</strong>" +
                "<br>&emsp;Dovoljeno: <strong>" + maxTedenskiCas + " ur</strong>";

            for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
                var dayData = weekData[name][dayIndex];
                for (var cellIndex = 0; cellIndex < dayData.length; cellIndex++) {
                    if (isSpecialOddelek(dayData[cellIndex])) continue;

                    var fullPosition = dayData[cellIndex].position + "," + dayData[cellIndex].smena;
                    if (!allErrors.errors[fullPosition]) {
                        allErrors.errors[fullPosition] = [];
                    }

                    allErrors.errors[fullPosition].push(errMsg);
                }
            }
        }
    });
}

///
// preverimo dnevni počitek
///
function preveri_dnevniPocitek (prevWeekData, currWeekData) {
    
    var nameKeys = Object.keys(currWeekData);
    nameKeys.forEach(name => {
        // najprej preverimo ponedeljek, ker je poseben ... potrebuje podatke iz prejšnjega tedna
        var minStartTime = "";
        var cellWithMinStartTime = null;
        var maxEndTime = "";

        // poiščemo minimalni začetni čas za osebo v ponedeljku; samo če dela tudi prejšnjo nedeljo
        if (prevWeekData !== null && prevWeekData[name] != null) {
            for (var i = 0; i < currWeekData[name][1].length; i++) {
                var cell = currWeekData[name][1][i];
                if (isSpecialOddelek(cell)) continue;

                if (minStartTime === "") {
                    minStartTime = cell.startTime;
                    cellWithMinStartTime = cell;
                } else {
                    if (compare_times_is_time1_greaterThan_time2(minStartTime, cell.startTime)) {
                        minStartTime = cell.startTime;
                        cellWithMinStartTime = cell;
                    }
                }
            }
        }
        // samo če oseba dela v ponedeljek, poišči maimalni končni čas v nedeljo
        var maxTimeInNextDay = false;
        if (minStartTime != "") {
            for (var i = 0; i < prevWeekData[name][7].length; i++) {
                var cell = prevWeekData[name][7][i];                
                if (isSpecialOddelek(cell)) continue;

                if (maxEndTime === "") {
                    maxEndTime = cell.endTime;
                    maxTimeInNextDay = check_is_time2inNextDay(cell.startTime, cell.endTime);
                } else {
                    var timeInNextDay = check_is_time2inNextDay(cell.startTime, cell.endTime);
                    // če je trenuten čas v naslednjem dnevu, maximalni pa ne avtomatsko prepiši
                    if (!maxTimeInNextDay && timeInNextDay) {
                        maxEndTime = cell.endTime;
                        maxTimeInNextDay = true;
                    } 
                    // če je maximalni čas v naslednjem dnevu, trenutni pa ne, ne glej naprej
                    else if (maxTimeInNextDay && !timeInNextDay) {
                        continue;
                    } 
                    // če sta max in trenutni čas v istem dnevu poglej kateri je večji; ne spreminjaj boola, ker sta v istem dnevu
                    else {
                        if (compare_times_is_time1_greaterThan_time2(cell.endTime, maxEndTime)) {
                            maxEndTime = cell.endTime;
                        }
                    }
                }
            }
        }
        
        var timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(maxEndTime, minStartTime);
        // pogledamo če je počitka dovolj in shranimo error če ga ni
        if (maxEndTime != "" && minStartTime != "") {// če je max čas v naselednjem dnevu in je veči od začetnega, pomeni da je začel preden je končal
            if (maxTimeInNextDay && compare_times_is_time1_greaterThan_time2(maxEndTime, minStartTime)) {
                timeDiff -= 24*60;
            }
            // prištej 1 dan - če je začetni čas manjši od končnega in končni čas ni čez polnoč
            else if (!maxTimeInNextDay && (compare_times_is_time1_greaterThan_time2(minStartTime, maxEndTime) || maxEndTime == minStartTime)) {
                timeDiff += 24*60;
            }
            if (timeDiff < dnevniPocitek * 60) {
                var pocitekUre = Math.abs(Number.parseInt(timeDiff / 60));
                var pocitekMinute = Math.abs(timeDiff % 60);
                var totalTime = timeDiff < 0 ? "- " : "";
                totalTime += pocitekUre.toString() + " ur " + pocitekMinute.toString() + " min";
                totalTime += timeDiff < 0 ? " (prekrivanje delovnega časa)" : "";

                var fullPosition = cellWithMinStartTime.position + "," + cellWithMinStartTime.smena;
                var originalName = "";
                if (data.zaposleni[name] != null) {
                    originalName = data.zaposleni[name].prikazanoImeZap;
                } else {
                    originalName = cellWithMinStartTime.originalName;
                }

                var errMsg = " - Dnevni počitek ni zagotovljen za osebo <strong><em>" + originalName + "</em></strong>!<br>" +
                    "&emsp;Zagotovljen počitek: <strong>" + totalTime + "</strong><br>" + 
                    "&emsp;Potreben počitek: <strong>" + dnevniPocitek + " ur</strong>"
                
                if (!allErrors.errors[fullPosition]) {
                    allErrors.errors[fullPosition] = [];
                }

                allErrors.errors[fullPosition].push(errMsg);
            }
        }
        
        // od torka do nedelje
        for (var dayIndex = 2; dayIndex < 8; dayIndex++) {
            minStartTime = "";
            cellWithMinStartTime = null;
            maxEndTime = "";

            // poiščemo minimalni začetni čas za osebo v dnevu;
            for (var i = 0; i < currWeekData[name][dayIndex].length; i++) {
                var cell = currWeekData[name][dayIndex][i];
                if (isSpecialOddelek(cell)) continue;

                if (minStartTime === "") {
                    minStartTime = cell.startTime;
                    cellWithMinStartTime = cell;
                } else {
                    if (compare_times_is_time1_greaterThan_time2(minStartTime, cell.startTime)) {
                        minStartTime = cell.startTime;
                        cellWithMinStartTime = cell;
                    }
                }
            }

            // samo če oseba dela v trenutnem dnevu, poišči maimalni končni čas v nedeljo
            var maxTimeInNextDay = false;
            if (minStartTime != "") {
                for (var i = 0; i < currWeekData[name][dayIndex-1].length; i++) {
                    var cell = currWeekData[name][dayIndex-1][i];                
                    if (isSpecialOddelek(cell)) continue;

                    if (maxEndTime === "") {
                        maxEndTime = cell.endTime;
                        maxTimeInNextDay = check_is_time2inNextDay(cell.startTime, cell.endTime);
                    } else {
                        var timeInNextDay = check_is_time2inNextDay(cell.startTime, cell.endTime);
                        // če je trenuten čas v naslednjem dnevu, maximalni pa ne avtomatsko prepiši
                        if (!maxTimeInNextDay && timeInNextDay) {
                            maxEndTime = cell.endTime;
                            maxTimeInNextDay = true;
                        } 
                        // če je maximalni čas v naslednjem dnevu, trenutni pa ne, ne glej naprej
                        else if (maxTimeInNextDay && !timeInNextDay) {
                            continue;
                        } 
                        // če sta max in trenutni čas v istem dnevu poglej kateri je večji; ne spreminjaj boola, ker sta v istem dnevu
                        else {
                            if (compare_times_is_time1_greaterThan_time2(cell.endTime, maxEndTime)) {
                                maxEndTime = cell.endTime;
                            }
                        }
                    }
                }
            }

            // pogledamo če je počitka dovolj in shranimo error če ga ni
            if (maxEndTime != "" && minStartTime != "") {
                var timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(maxEndTime, minStartTime);
                // če je max čas v naselednjem dnevu in je veči od začetnega, pomeni da je začel preden je končal
                if (maxTimeInNextDay && compare_times_is_time1_greaterThan_time2(maxEndTime, minStartTime)) {
                    timeDiff -= 24*60;
                }
                // prištej 1 dan - če je začetni čas manjši od končnega in končni čas ni čez polnoč
                else if (!maxTimeInNextDay && (compare_times_is_time1_greaterThan_time2(minStartTime, maxEndTime) || maxEndTime == minStartTime)) {
                    timeDiff += 24*60;
                }
                if (timeDiff < dnevniPocitek * 60) {
                    var pocitekUre = Math.abs(Number.parseInt(timeDiff / 60));
                    var pocitekMinute = Math.abs(timeDiff % 60);
                    var totalTime = timeDiff < 0 ? "- " : "";
                    totalTime += pocitekUre.toString() + " ur " + pocitekMinute.toString() + " min";
                    totalTime += timeDiff < 0 ? " (prekrivanje delovnega časa)" : "";

                    var fullPosition = cellWithMinStartTime.position + "," + cellWithMinStartTime.smena;
                    var originalName = "";
                    if (data.zaposleni[name] != null) {
                        originalName = data.zaposleni[name].prikazanoImeZap;
                    } else {
                        originalName = cellWithMinStartTime.originalName;
                    }

                    var errMsg = " - Dnevni počitek ni zagotovljen za osebo <strong><em>" + originalName + "</em></strong>!<br>" +
                        "&emsp;Zagotovljen počitek: <strong>" + totalTime + "</strong><br>" + 
                        "&emsp;Potreben počitek: <strong>" + dnevniPocitek + " ur</strong>"
                    
                    if (!allErrors.errors[fullPosition]) {
                        allErrors.errors[fullPosition] = [];
                    }

                    allErrors.errors[fullPosition].push(errMsg);
                }
            }
        }
    });
}


///
// preverimo povprečen 14 dnevni počitek
// če v prejšnjem tednu ni bil zagotovljen tedenski počitek, potrebuje v tem tednu 2 dni.
///
function preveri_dvoTedenskiPocitek (prevWeekData, currWeekData) {
    // če ni podatka za prejšnji teden končaj
    if (prevWeekData === null || Object.keys(prevWeekData).length < 1) return;

    // imena v obeh tednih
    var prevWeekNames = Object.keys(prevWeekData);
    var currWeekNames = Object.keys(currWeekData);
    
    // preveri od ponedeljka do sobote za prejšnji teden
    function get_steviloProstihDni_PrejsniTeden (name) {
        var freeDaysNum_PrevWeek = 0;
        
        // če prejšni teden ta oseba ni delala potem ustavi zanko in vrni 6
        if (!(prevWeekNames.includes(name))) return 7;
        
        var maxEndTime_cell = null;
        if (prevWeekData[name][0]) {
            maxEndTime_cell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][0]);
        }

        for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
            var dayData = prevWeekData[name][dayIndex];
            var minStartTime_cell = get_cell_minStartTime_forWorker_inDay(dayData);

            // če nismo našli minimalnega časa pojdi na naslednji dan
            if (minStartTime_cell === null && (dayIndex < 6 || dayIndex === 7)) {
                continue;
            }
            else if (minStartTime_cell === null && dayIndex === 6) {
                var sundayCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
                if (sundayCell === null) {
                    freeDaysNum_PrevWeek++;
                }
                continue;
            }

            // če smo našli začetni čas in oseba ni delala prejšno nedeljo ...
            if (maxEndTime_cell === null) {                
                freeDaysNum_PrevWeek = dayIndex - 1;
                // če smo našli prvi delovni dan šele v sredo (ali kasneje) in je nedelja prosta vrni št. prostih dni
                if (freeDaysNum_PrevWeek > 1) return freeDaysNum_PrevWeek;

                maxEndTime_cell = get_cell_maxEndTime_forWorker_inDay(dayData);
                continue;
            }

            var timeDiff = get_timeDiference_between_TwoDays_inMinutes(maxEndTime_cell, minStartTime_cell);
            
            // prištejemo manjkajoče dneve
            if (maxEndTime_cell !== null) {
                var dayDiff = Number.parseInt(minStartTime_cell.dayIndex) - Number.parseInt(maxEndTime_cell.dayIndex) - 1;
                timeDiff += dayDiff *24 *60;
            }

            // odštejemo dnevni počitek in delimo z 24 da dobimo št. prostih dni
            timeDiff -= dnevniPocitek * 60;
            if (timeDiff > 0) {
                freeDaysNum_PrevWeek += Number.parseInt(timeDiff / 60 / 24);
            }

            if (freeDaysNum_PrevWeek > 1) {
                return freeDaysNum_PrevWeek;
            }

            maxEndTime_cell = get_cell_maxEndTime_forWorker_inDay(dayData);
            // če nismo našli nobenega časa
            if (dayIndex > 3 && maxEndTime_cell === null) return 4;
        }
        return freeDaysNum_PrevWeek;
    }

    // preverimo nedeljo v prejšnjem tedu
    function get_LastSundayFreeDay (name) {
        if (!(prevWeekNames.includes(name))) return 0;
        var sundayCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
        var saturdayCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][6]);
        var mondayCell = get_cell_minStartTime_forWorker_inDay(currWeekData[name][1]);


        // če je delal v nedeljo potem vrni 0
        if (sundayCell !== null) {
            return 0;
        }
        // če v soboto ali ponedeljek ne dela vrni prost dan
        else if (saturdayCell === null || mondayCell === null) {
            return 1;
        }

        // pogledamo čas od sobote do ponedeljka
        var timeDiff_satToMon = get_timeDiference_between_TwoDays_inMinutes(saturdayCell, mondayCell);
        timeDiff_satToMon += 24 * 60;

        // odštejemo dnevni počitek
        timeDiff_satToMon -= dnevniPocitek * 60;

        return Number.parseInt(timeDiff_satToMon / 60 / 24);
    }

    function get_steviloProstihDni_trenutenTeden (name) {
        var freeDaysNum_currWeek = 0;
        
        var maxEndTime_cell = null;
        if (prevWeekNames.includes(name) && prevWeekData[name][7]) {
            maxEndTime_cell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
        }

        for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
            var dayData = currWeekData[name][dayIndex];
            var minStartTime_cell = get_cell_minStartTime_forWorker_inDay(dayData);

            // če nismo našli minimalnega časa pojdi na naslednji dan
            if (minStartTime_cell === null && dayIndex < 7) {
                continue;
            } else if (minStartTime_cell === null && dayIndex === 7) {
                freeDaysNum_currWeek += maxEndTime_cell === null ? 7 : (7 - Number.parseInt(maxEndTime_cell.dayIndex));
                return freeDaysNum_currWeek;
            }

            // če smo našli začetni čas in oseba ni delala prejšno nedeljo ...
            if (maxEndTime_cell === null) {
                // če je nedelja in pondeljek, torek delaven -> pogledamo če je med soboto in torkom 59 ur počitka
                    // če je dodamo 1, drugače dodamo 0 --- nedelja že upoštevana
                if (dayIndex === 2) {
                    // če tudi za soboto ni podatka
                    if (!(prevWeekData[name]) || !(prevWeekData[name][6])) {
                        freeDaysNum_currWeek += 1;

                        maxEndTime_cell = get_cell_maxEndTime_forWorker_inDay(dayData);
                        continue;
                    }

                    // če je v soboto samo na posebnih oddelkih
                    var saturdayCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][6]);
                    if (saturdayCell === null) {
                        freeDaysNum_currWeek += 1;
                    }
                    else {
                        var timeDiff_sobDoTor = get_timeDiference_between_TwoDays_inMinutes(saturdayCell, minStartTime_cell);
                        // če je razlika časov večja od dnevnega počitka, potem dodaj prost dan (nedelja že upoštevana ...)
                        if (timeDiff_sobDoTor >= (dnevniPocitek * 60)) {
                            freeDaysNum_currWeek += 1;
                        }
                    }
                }
                else {
                    freeDaysNum_currWeek = dayIndex - 1;
                }
                // če smo našli prvi delovni dan šele v sredo (ali kasneje) in je nedelja prosta vrni št. prostih dni
                if (freeDaysNum_currWeek > 1) return freeDaysNum_currWeek;

                maxEndTime_cell = get_cell_maxEndTime_forWorker_inDay(dayData);
                continue;
            }

            var timeDiff = get_timeDiference_between_TwoDays_inMinutes(maxEndTime_cell, minStartTime_cell);
            
            // prištejemo manjkajoče dneve
            if (maxEndTime_cell !== null) {

                var endDayIndex = Number.parseInt(maxEndTime_cell.dayIndex) === 7 ? 0 : Number.parseInt(maxEndTime_cell.dayIndex);
                
                var dayDiff = Number.parseInt(minStartTime_cell.dayIndex) - endDayIndex - 1;
                timeDiff += dayDiff *24 *60;
            }

            // odštejemo dnevni počitek in delimo z 24 da dobimo št. prostih dni
            timeDiff -= dnevniPocitek * 60;
            if (timeDiff > 0) {
                freeDaysNum_currWeek += Number.parseInt(timeDiff / 60 / 24);
            }

            if (freeDaysNum_currWeek > 1) {
                return freeDaysNum_currWeek;
            }

            maxEndTime_cell = get_cell_maxEndTime_forWorker_inDay(dayData);
            // če nismo našli nobenega časa
            if (dayIndex > 3 && maxEndTime_cell === null) return 4;
            // if (dayIndex === 7 && maxEndTime_cell === null) return 7;
        }
        return freeDaysNum_currWeek;
    }

    currWeekNames.forEach(name => {
        var prevWeekFreeDays = get_steviloProstihDni_PrejsniTeden(name) + get_LastSundayFreeDay(name);
        var currWeekFreeDays = get_steviloProstihDni_trenutenTeden(name);

        // če imamo 2 prosta dneva ali več je ok
        if (prevWeekFreeDays + currWeekFreeDays > 1) return;

        var tedenskiPocitek = dnevniPocitek + 24;
        var dvoDnevniPocitek = dnevniPocitek + 24 + 24;
        var sklonDniPrev = prevWeekFreeDays === 0 ? "dni" : "dan"
        var sklonDniCurr = currWeekFreeDays === 0 ? "dni" : "dan"

        for (var i = 1; i < 8; i++) {
            for (var j = 0; j < currWeekData[name][i].length; j++) {
                var cellData = currWeekData[name][i][j];
                var originalName = get_originalName(name, cellData);

                var errMsg = " - Povprečen dvo-tedenski počitek za osebo <strong><em>" + originalName + "</em></strong>" +
                    " ni zagotovljen. V trenutnem in prejšnjem tednu skupaj sta <strong>potrebna 2 prosta dneva</strong>!" + 
                    " To pomeni: <strong>2x po " + tedenskiPocitek.toString() + " ur</strong> ali <strong>1x " +
                    dvoDnevniPocitek.toString() + " ur</strong> počitka.<br>" + 
                    "&emsp;Zagotovljen počitek v <em>prejšnjem tednu</em>: <strong>" + 
                    prevWeekFreeDays + " " + sklonDniPrev + "</strong>" + 
                    "<br>&emsp;Zagotovljen počitek v <em>trenutnem tednu</em>: <strong>" + 
                    currWeekFreeDays + " " + sklonDniCurr + "</strong>";

                insert_errorWarrning_tooltipMessage(errMsg, get_fullPosition(cellData), "errors");
            }
        }
    });
}

///
// preveri prepoved deljenega dela za osebe z 4h/dan ali manj
///
function preveri_prepovedDeljenegaDela (weekData) {
    var names = Object.keys(weekData);
    var errorCells = [];
    
    names.forEach(name => {
        var maxDnevniCas = null;
        try {
            maxDnevniCas = data.zaposleni[name].maxUrDanZap;
        } catch (e) {
            maxDnevniCas = null;
            return;
        }
        // še eno varovalo just in case
        if (!maxDnevniCas || maxDnevniCas > 4) return;
        
        // zarotiramo po dnevih in preverimo če je kje deljeno z več kot 1h premora
        for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
            for (var i = 0; i < weekData[name][dayIndex].length; i++) {
                var firstCell = weekData[name][dayIndex][i];
                // če je oddelek brez časa nas ne zanima
                if (isSpecialOddelek(firstCell)) continue;
                // če konča v naslednjem dnevu nas ne zanima
                if (check_is_time2inNextDay(firstCell.startTime, firstCell.endTime)) continue;
                
                var endTime = firstCell.endTime;
                for (var j = 0; j < weekData[name][dayIndex].length; j++) {
                    var secondCell = weekData[name][dayIndex][j];
                    // če je oddelek brez časa nas ne zanima
                    if (i === j || isSpecialOddelek(secondCell)) continue;
                    
                    var startTime = secondCell.startTime;

                    // če je začetni čas večji od končnega preskoči
                    if (check_is_time2inNextDay(endTime, startTime)) continue;
                    
                    // end time je čas konca na prvem oddelku, kar je čas pričetka za razliko časov ....
                    var timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(endTime, startTime);

                    // dodamo celico v array če je to potrebno
                    if (timeDiff > 59) {
                        firstCell.currName = name;
                        secondCell.currName = name;
                        errorCells.push(firstCell);
                        errorCells.push(secondCell);
                    }
                }
            }
        }
    });

    // shranimo error
    errorCells.forEach(cell => {
        var originalName = get_originalName(cell.currName, cell);
        var errMsg = " - Oseba <strong><em>" + originalName + "</em></strong>" +
        " ima dovoljeni dnevni čas krajši od 4 ure in <strong>ne sme delati deljeno</strong>!";

        insert_errorWarrning_tooltipMessage(errMsg, get_fullPosition(cell), "errors");
    });
}


///
// preveri št. oddelanih nedelij v letu
///
function preveri_stNedelijLetno (weekData) {
    if (!data.sundayData) return;
    // pogledamo za vsakega delavca ki dela v nedeljo
    var names = Object.keys(weekData);
    names.forEach(name => {
        if (!data.zaposleni[name] || !data.sundayData[name]) return;

        for (var i = 0; i < weekData[name][7].length; i++) {   
            var cell = weekData[name][7][i];
            // če je poseben oddelek nas ne zanima - ni delal
            if (isSpecialOddelek(cell)) continue;

            var oddelaneNedelje = data.sundayData[name].yearSundays;
            var dovoljeneNedelje = data.zaposleni[name].maxNedelijZap;

            if (oddelaneNedelje > dovoljeneNedelje) {
                var originalName = get_originalName(cell.currName, cell);
                var errMsg = " - Oseba <strong><em>" + originalName + "</em></strong>" +
                    " je prekoračila letni limit oddelanih nedelij.<br>" + 
                    "&emsp;Št. oddelanih nedelij v letu (vključno s trenutno): <strong>" + oddelaneNedelje + "</strong><br>" +
                    "&emsp;Št. dovoljenih nedelij v letu: <strong>" + dovoljeneNedelje + "</strong>";
                    
                insert_errorWarrning_tooltipMessage(errMsg, get_fullPosition(cell), "errors");
            }
            else if (oddelaneNedelje === dovoljeneNedelje) {
                var originalName = get_originalName(cell.currName, cell);
                var warnMsg = " - Oseba <strong><em>" + originalName + "</em></strong>" +
                    " je dosegla letni limit oddelanih nedelij (vključno s trenutno)" +
                    " - <strong>" + oddelaneNedelje + " nedelij</strong>. To je zadnja dovoljena nedelja v tem letu!";
                    
                    
                insert_errorWarrning_tooltipMessage(warnMsg, get_fullPosition(cell), "warnings");
                
            }
        }
    });
}