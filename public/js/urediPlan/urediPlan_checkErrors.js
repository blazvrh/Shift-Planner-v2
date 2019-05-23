

var dnevniPocitek = 11; // potreben minimalni dnevni počitek v urah
var tedenskiPocitek = 36; // potreben minimalni tedenski počitek v urah

// preveri če je celica na posebnem oddelku (komentar, dopusti)
function isSpecialOddelek (cellData) {
    if (cellData.oddelekName === "Komentarji" || cellData.oddelekName === "ld.nn, boln.") {
        return true;
    } else {
        return false;
    }
}


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
// preveriomo dnevni počitek
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

        // pogledamo če je počitka dovolj in shranimo error če ga ni
        if (maxEndTime != "" && minStartTime != "") {
            // prištej 1 dan - če je začetni čas manjši od končnega in končni čas ni čez polnoč
            let timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(maxEndTime, minStartTime);
            if (!maxTimeInNextDay && (compare_times_is_time1_greaterThan_time2(minStartTime, maxEndTime) || maxEndTime == minStartTime)) {
                timeDiff += 24*60;
            }
            if (timeDiff < dnevniPocitek * 60) {
                let pocitekUre = Number.parseInt(timeDiff / 60);
                let pocitekMinute = timeDiff % 60;
                let totalTime = pocitekUre.toString() + " ur " + pocitekMinute.toString() + " min";

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
                // prištej 1 dan - če je začetni čas manjši od končnega in končni čas ni čez polnoč
                if (!maxTimeInNextDay && (compare_times_is_time1_greaterThan_time2(minStartTime, maxEndTime) || maxEndTime == minStartTime)) {
                    timeDiff += 24*60;
                }
                if (timeDiff < dnevniPocitek * 60) {
                    let pocitekUre = Number.parseInt(timeDiff / 60);
                    let pocitekMinute = timeDiff % 60;
                    let totalTime = pocitekUre.toString() + " ur " + pocitekMinute.toString() + " min";

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