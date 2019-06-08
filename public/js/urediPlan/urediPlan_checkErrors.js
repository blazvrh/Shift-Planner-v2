
///
// preveri če obstaja prekrivanje časov v istem dnevu za osebo
///
function preveri_cas_prekrivanje (weekData) {
    let allNames = Object.keys(weekData);

    allNames.forEach(name => {
        for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
            let dayData = weekData[name][dayIndex];
            // če sta manj kot 2 vnosa, prekrivanje ni možno
            if (dayData.length < 2) continue;
            
            let dayCellErrors = [];
            // primerjamo končni čas vsakega elemeta z začetnim časom vsakega elementa
            // zadnjega ne rabimo več pregledovati ker smo ga primerjali že vsemi drugimi
            for (let i = 0; i < dayData.length - 1; i++) {
                let firstCell = dayData[i];
                if (isSpecialOddelek(firstCell)) continue;

                for (let j = i + 1; j < dayData.length; j++) {
                    let secondCell = dayData[j];
                    if (isSpecialOddelek(secondCell)) continue;

                    let cell1StartTime = firstCell.startTime;
                    let cell1EndTime = firstCell.endTime;
                    let cell2StartTime = secondCell.startTime;
                    let cell2EndTime = secondCell.endTime;
                    let cell1_inNextDay = check_is_time2inNextDay(cell1StartTime, cell1EndTime);
                    let cell2_inNextDay = check_is_time2inNextDay(cell2StartTime, cell2EndTime);
                    
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
            let oddelkiSPrekrivanjemArr = [];
            let fullTooltipPositions = [];
            dayCellErrors.forEach(cellData => {
                let oddName = cellData.oddelekName + " (" + cellData.smena + ")";
                if (!(oddelkiSPrekrivanjemArr.includes(oddName))) {
                    oddelkiSPrekrivanjemArr.push(oddName);
                }
                fullTooltipPositions.push(cellData.position + "," + cellData.smena);
            });
            
            let prikazanoImeZap = ""
            if (data.zaposleni[name] != null) {
                prikazanoImeZap = data.zaposleni[name].prikazanoImeZap
            } else {
                prikazanoImeZap = name;
            }
            
            let errMsg = " - Zaznano prekrivanje delovnega časa za osebo <strong><em>" + prikazanoImeZap + 
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
    let allNames = Object.keys(weekData);

    allNames.forEach(name => {
        if (!(name in data.prikazanaImena)) return;
        let tedenskiDelovniCas = 0;
        let dnevniDelovniCas = 0;
        let originalName = data.zaposleni[name].prikazanoImeZap;
        
        for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
            let dayData = weekData[name][dayIndex];
            dnevniDelovniCas = 0;
            for (let i = 0; i < dayData.length; i++) {
                let cellData = dayData[i];
                if (isSpecialOddelek(cellData)) continue;

                let startTime = cellData.startTime;
                let endTime = cellData.endTime;
                dnevniDelovniCas += get_timeDifference_inMinutes_betweenTwoTimes(startTime, endTime);
            }
            tedenskiDelovniCas += dnevniDelovniCas;

            // preverimo če je dnevni čas prekoračen            
            let maxDnevniCas = data.zaposleni[name].maxUrDanZap;
            
            if (dnevniDelovniCas > maxDnevniCas * 60) {
                let opravljeneUre = Number.parseInt(dnevniDelovniCas / 60);
                let opravljeneMinute = dnevniDelovniCas % 60;
                let opravljenCas = opravljeneUre.toString() + " ur";
                opravljenCas += opravljeneMinute > 0 ? " " + opravljeneMinute.toString() + " min" : "";

                let errMsg = " - Prekoračen dnevni delovni čas za osebo <strong><em>" + originalName + "</em></strong>!" +
                    "<br>&emsp;Opravil/-a: <strong>" + opravljenCas + "</strong>" +
                    "<br>&emsp;Dovoljeno: <strong>" + maxDnevniCas + " ur</strong>";

                for (let cellIndex = 0; cellIndex < dayData.length; cellIndex++) {
                    if (isSpecialOddelek(dayData[cellIndex])) continue;

                    let fullPosition = dayData[cellIndex].position + "," + dayData[cellIndex].smena;
                    if (!allErrors.errors[fullPosition]) {
                        allErrors.errors[fullPosition] = [];
                    }

                    allErrors.errors[fullPosition].push(errMsg);
                }
            }
        }

        // preverimo če je tedenski čas prekoračen  
        let maxTedenskiCas = data.zaposleni[name].maxUrTedenZap;
        
        if (tedenskiDelovniCas > maxTedenskiCas * 60) {
            let opravljeneUre = Number.parseInt(tedenskiDelovniCas / 60);
            let opravljeneMinute = tedenskiDelovniCas % 60;
            let opravljenCas = opravljeneUre.toString() + " ur";
            opravljenCas += opravljeneMinute > 0 ? " " + opravljeneMinute.toString() + " min" : "";

            let errMsg = " - Prekoračen tedenski delovni čas za osebo <strong><em>" + originalName + "</em></strong>!" +
                "<br>&emsp;Opravil/-a: <strong>" + opravljenCas + "</strong>" +
                "<br>&emsp;Dovoljeno: <strong>" + maxTedenskiCas + " ur</strong>";

            for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
                let dayData = weekData[name][dayIndex];
                for (let cellIndex = 0; cellIndex < dayData.length; cellIndex++) {
                    if (isSpecialOddelek(dayData[cellIndex])) continue;

                    let fullPosition = dayData[cellIndex].position + "," + dayData[cellIndex].smena;
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
    let nameKeys = Object.keys(currWeekData);
    nameKeys.forEach(name => {
        // najprej preverimo ponedeljek, ker je poseben ... potrebuje podatke iz prejšnjega tedna
        let minStartTime = "";
        let cellWithMinStartTime = null;
        let maxEndTime = "";

        // poiščemo minimalni začetni čas za osebo v ponedeljku; samo če dela tudi prejšnjo nedeljo
        if (prevWeekData[name] != null) {
            for (let i = 0; i < currWeekData[name][1].length; i++) {
                let cell = currWeekData[name][1][i];
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
        let maxTimeInNextDay = false;
        if (minStartTime != "") {
            for (let i = 0; i < prevWeekData[name][7].length; i++) {
                let cell = prevWeekData[name][7][i];                
                if (isSpecialOddelek(cell)) continue;

                if (maxEndTime === "") {
                    maxEndTime = cell.endTime;
                    maxTimeInNextDay = check_is_time2inNextDay(cell.startTime, cell.endTime);
                } else {
                    let timeInNextDay = check_is_time2inNextDay(cell.startTime, cell.endTime);
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
        
        let timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(maxEndTime, minStartTime);
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
                let pocitekUre = Math.abs(Number.parseInt(timeDiff / 60));
                let pocitekMinute = Math.abs(timeDiff % 60);
                let totalTime = timeDiff < 0 ? "- " : "";
                totalTime += pocitekUre.toString() + " ur " + pocitekMinute.toString() + " min";
                totalTime += timeDiff < 0 ? " (prekrivanje delovnega časa)" : "";

                let fullPosition = cellWithMinStartTime.position + "," + cellWithMinStartTime.smena;
                let originalName = "";
                if (data.zaposleni[name] != null) {
                    originalName = data.zaposleni[name].prikazanoImeZap;
                } else {
                    originalName = cellWithMinStartTime.originalName;
                }

                let errMsg = " - Dnevni počitek ni zagotovljen za osebo <strong><em>" + originalName + "</em></strong>!<br>" +
                    "&emsp;Zagotovljen počitek: <strong>" + totalTime + "</strong><br>" + 
                    "&emsp;Potreben počitek: <strong>" + dnevniPocitek + " ur</strong>"
                
                if (!allErrors.errors[fullPosition]) {
                    allErrors.errors[fullPosition] = [];
                }

                allErrors.errors[fullPosition].push(errMsg);
            }
        }
        
        // od torka do nedelje
        for (let dayIndex = 2; dayIndex < 8; dayIndex++) {
            minStartTime = "";
            cellWithMinStartTime = null;
            maxEndTime = "";

            // poiščemo minimalni začetni čas za osebo v dnevu;
            for (let i = 0; i < currWeekData[name][dayIndex].length; i++) {
                let cell = currWeekData[name][dayIndex][i];
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
            let maxTimeInNextDay = false;
            if (minStartTime != "") {
                for (let i = 0; i < currWeekData[name][dayIndex-1].length; i++) {
                    let cell = currWeekData[name][dayIndex-1][i];                
                    if (isSpecialOddelek(cell)) continue;

                    if (maxEndTime === "") {
                        maxEndTime = cell.endTime;
                        maxTimeInNextDay = check_is_time2inNextDay(cell.startTime, cell.endTime);
                    } else {
                        let timeInNextDay = check_is_time2inNextDay(cell.startTime, cell.endTime);
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
                let timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(maxEndTime, minStartTime);
                // če je max čas v naselednjem dnevu in je veči od začetnega, pomeni da je začel preden je končal
                if (maxTimeInNextDay && compare_times_is_time1_greaterThan_time2(maxEndTime, minStartTime)) {
                    timeDiff -= 24*60;
                }
                // prištej 1 dan - če je začetni čas manjši od končnega in končni čas ni čez polnoč
                else if (!maxTimeInNextDay && (compare_times_is_time1_greaterThan_time2(minStartTime, maxEndTime) || maxEndTime == minStartTime)) {
                    timeDiff += 24*60;
                }
                if (timeDiff < dnevniPocitek * 60) {
                    let pocitekUre = Math.abs(Number.parseInt(timeDiff / 60));
                    let pocitekMinute = Math.abs(timeDiff % 60);
                    let totalTime = timeDiff < 0 ? "- " : "";
                    totalTime += pocitekUre.toString() + " ur " + pocitekMinute.toString() + " min";
                    totalTime += timeDiff < 0 ? " (prekrivanje delovnega časa)" : "";

                    let fullPosition = cellWithMinStartTime.position + "," + cellWithMinStartTime.smena;
                    let originalName = "";
                    if (data.zaposleni[name] != null) {
                        originalName = data.zaposleni[name].prikazanoImeZap;
                    } else {
                        originalName = cellWithMinStartTime.originalName;
                    }

                    let errMsg = " - Dnevni počitek ni zagotovljen za osebo <strong><em>" + originalName + "</em></strong>!<br>" +
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
// preveri če ima oseba dodaten prost dan po delovni nedelji (če trenutna nedelja prosta preskočimo)
///
function preveri_prostDan_poDelovniNedelji (prevWeekData, currWeekData) {
    // če ni podatka za prejšnji teden končaj
    if (prevWeekData === null || Object.keys(prevWeekData).length < 1) return;

    // ustvarimo array vseh delavcev ki so delali prejšnjo nedeljo
    let prevSundayWorkers = [];
    let prevWeekNames = Object.keys(prevWeekData);
    prevWeekNames.forEach(name => {
        for (let i = 0; i < prevWeekData[name][7].length; i++) {
            let cell = prevWeekData[name][7][i];
            if (isSpecialOddelek(cell)) {
                continue;
            } else {
                prevSundayWorkers.push(name);
            }
        }
    });
    // ustvarimo array vseh delavcev ki delajo to nedeljo
    let currSundayWorkers = [];
    let currWeekNames = Object.keys(currWeekData);
    currWeekNames.forEach(name => {
        for (let i = 0; i < currWeekData[name][7].length; i++) {
            let cell = currWeekData[name][7][i];
            if (isSpecialOddelek(cell)) {
                continue;
            } else {
                currSundayWorkers.push(name);
            }
        }
    });

    // za vsako osebo v tem tednu
    let nameKeys = Object.keys(currWeekData);
    nameKeys.forEach(name => {
        // če oseba ni delala prejšnjo ali to nedeljo jo preskoči
        if (!(prevSundayWorkers.includes(name)) || !(currSundayWorkers.includes(name))) return;
        
        let maxRestTime = 0;
        let cellWithMaxRest = null;

        let lastEndTimeCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
        let endTimeInNextDay = check_is_time2inNextDay(lastEndTimeCell.startTime, lastEndTimeCell.endTime);
        let lastEndTimeDayIndex = 0;
        
        for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
            let currDayData = currWeekData[name][dayIndex];
            let startTimeCell = get_cell_minStartTime_forWorker_inDay(currDayData);
            
            if (startTimeCell != null) {
                // preračunamo razliko v času
                let restTime = get_timeDifference_inMinutes_betweenTwoTimes(lastEndTimeCell.endTime, startTimeCell.startTime);
                // prištejemo manjkajoče dneve
                let dayDiff = Number.parseInt(startTimeCell.dayIndex) - Number.parseInt(lastEndTimeDayIndex) - 1;
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
        }

        // izpišemo error če je potrebno
        if (maxRestTime < ((dnevniPocitek * 60) + (24 * 60))) {
            let fullPosition = get_fullPosition(cellWithMaxRest);
            let originalName = get_originalName(name, cellWithMaxRest);
            let restTimeString = maxRestTime < 0 ? "- " : "";

            let maxRestHous = Math.abs(Number.parseInt(maxRestTime / 60));
            let maxRestMinutes = Math.abs(maxRestTime % 60);
            restTimeString += maxRestHous.toString() + " ur " + maxRestMinutes.toString() + " min";
            restTimeString += maxRestTime < 0 ? " (prekrivanje delovnega časa)" : "";

            let warnMsg = " - Potreben <strong>prost dan</strong> po delovni nedelji za osebo <strong><em>" 
                + originalName + "</em></strong>!<br>" + 
                "&emsp;Maksimalni zagotovljeni počitek po oddelani nedelji: <strong>" + restTimeString + "</strong>"+
                "<br>&emsp;Poreben počitek po oddelani nedelji: <strong>" + (24 + dnevniPocitek).toString() + 
                " ur</strong>";

            insert_errorWarrning_tooltipMessage(warnMsg, fullPosition, "errors");
        }
    });
}

///
// preverimo povprečen 14 dnevni počitek
// če v prejšnjem tednu ni bil zagotovljen tedenski počitek, potrebuje v tem tednu 2 dni.
///
function preveri_dvoTedenskiPocitek (prevWeekData, currWeekData) {

    // imena v obeh tednih
    const prevWeekNames = Object.keys(prevWeekData);
    const currWeekNames = Object.keys(currWeekData);
    
    // preveri od ponedeljka do sobote za prejšnji teden
    function get_steviloProstihDni_PrejsniTeden (name) {
        let freeDaysNum_PrevWeek = 0;
        
        // če prejšni teden ta oseba ni delala potem ustavi zanko in vrni 6
        if (!(prevWeekNames.includes(name))) return 7;
        
        let maxEndTime_cell = null;
        if (prevWeekData[name][0]) {
            maxEndTime_cell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][0]);
        }

        for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
            const dayData = prevWeekData[name][dayIndex];
            let minStartTime_cell = get_cell_minStartTime_forWorker_inDay(dayData);

            // če nismo našli minimalnega časa pojdi na naslednji dan
            if (minStartTime_cell === null && (dayIndex < 6 || dayIndex === 7)) {
                continue;
            }
            else if (minStartTime_cell === null && dayIndex === 6) {
                let sundayCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
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

            let timeDiff = get_timeDiference_between_TwoDays_inMinutes(maxEndTime_cell, minStartTime_cell);
            
            // prištejemo manjkajoče dneve
            if (maxEndTime_cell !== null) {
                let dayDiff = Number.parseInt(minStartTime_cell.dayIndex) - Number.parseInt(maxEndTime_cell.dayIndex) - 1;
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
        let sundayCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
        let saturdayCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][6]);
        let mondayCell = get_cell_minStartTime_forWorker_inDay(currWeekData[name][1]);


        // če je delal v nedeljo potem vrni 0
        if (sundayCell !== null) {
            return 0;
        }
        // če v soboto ali ponedeljek ne dela vrni prost dan
        else if (saturdayCell === null || mondayCell === null) {
            return 1;
        }

        // pogledamo čas od sobote do ponedeljka
        let timeDiff_satToMon = get_timeDiference_between_TwoDays_inMinutes(saturdayCell, mondayCell);
        timeDiff_satToMon += 24 * 60;

        // odštejemo dnevni počitek
        timeDiff_satToMon -= dnevniPocitek * 60;

        return Number.parseInt(timeDiff_satToMon / 60 / 24);
    }

    function get_steviloProstihDni_trenutenTeden (name) {
        let freeDaysNum_currWeek = 0;
        
        let maxEndTime_cell = null;
        if (prevWeekNames.includes(name) && prevWeekData[name][7]) {
            maxEndTime_cell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
        }

        for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
            const dayData = currWeekData[name][dayIndex];
            let minStartTime_cell = get_cell_minStartTime_forWorker_inDay(dayData);

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
                    const saturdayCell = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][6]);
                    if (saturdayCell === null) {
                        freeDaysNum_currWeek += 1;
                    }
                    else {
                        let timeDiff_sobDoTor = get_timeDiference_between_TwoDays_inMinutes(saturdayCell, minStartTime_cell);
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

            let timeDiff = get_timeDiference_between_TwoDays_inMinutes(maxEndTime_cell, minStartTime_cell);
            
            // prištejemo manjkajoče dneve
            if (maxEndTime_cell !== null) {

                const endDayIndex = Number.parseInt(maxEndTime_cell.dayIndex) === 7 ? 0 : Number.parseInt(maxEndTime_cell.dayIndex);
                
                let dayDiff = Number.parseInt(minStartTime_cell.dayIndex) - endDayIndex - 1;
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
        const prevWeekFreeDays = get_steviloProstihDni_PrejsniTeden(name) + get_LastSundayFreeDay(name);
        const currWeekFreeDays = get_steviloProstihDni_trenutenTeden(name);

        // če imamo 2 prosta dneva ali več je ok
        if (prevWeekFreeDays + currWeekFreeDays > 1) return;

        const tedenskiPocitek = dnevniPocitek + 24;
        const dvoDnevniPocitek = dnevniPocitek + 24 + 24;
        const sklonDniPrev = prevWeekFreeDays === 0 ? "dni" : "dan"
        const sklonDniCurr = currWeekFreeDays === 0 ? "dni" : "dan"

        for (let i = 1; i < 8; i++) {
            for (let j = 0; j < currWeekData[name][i].length; j++) {
                const cellData = currWeekData[name][i][j];
                const originalName = get_originalName(name, cellData);

                let errMsg = " - Povprečen dvo-tedenski počitek za osebo <strong><em>" + originalName + "</em></strong>" +
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

    const names = Object.keys(weekData);
    let errorCells = [];
    
    names.forEach(name => {
        let maxDnevniCas = null;
        try {
            maxDnevniCas = data.zaposleni[name].maxUrDanZap;
        } catch {
            maxDnevniCas = null;
            return;
        }
        // še eno varovalo just in case
        if (!maxDnevniCas || maxDnevniCas > 4) return;
        
        // zarotiramo po dnevih in preverimo če je kje deljeno z več kot 1h premora
        for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
            for (let i = 0; i < weekData[name][dayIndex].length; i++) {
                let firstCell = weekData[name][dayIndex][i];
                // če je oddelek brez časa nas ne zanima
                if (isSpecialOddelek(firstCell)) continue;
                // če konča v naslednjem dnevu nas ne zanima
                if (check_is_time2inNextDay(firstCell.startTime, firstCell.endTime)) continue;
                
                let endTime = firstCell.endTime;
                for (let j = 0; j < weekData[name][dayIndex].length; j++) {
                    let secondCell = weekData[name][dayIndex][j];
                    // če je oddelek brez časa nas ne zanima
                    if (i === j || isSpecialOddelek(secondCell)) continue;
                    
                    let startTime = secondCell.startTime;

                    // če je začetni čas večji od končnega preskoči
                    if (check_is_time2inNextDay(endTime, startTime)) continue;
                    
                    // end time je čas konca na prvem oddelku, kar je čas pričetka za razliko časov ....
                    let timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(endTime, startTime);

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
        let originalName = get_originalName(cell.currName, cell);
        let errMsg = " - Oseba <strong><em>" + originalName + "</em></strong>" +
        " ima dovoljeni dnevni čas krajši od 4 ure in <strong>ne sme delati deljeno</strong>!";

        insert_errorWarrning_tooltipMessage(errMsg, get_fullPosition(cell), "errors");
    });
}