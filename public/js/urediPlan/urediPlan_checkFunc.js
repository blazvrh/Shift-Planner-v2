
// poišče originalno ime za celico
function get_originalName (currName, cell) {
    var originalName = "";
    if (data.zaposleni[currName] != null) {
        originalName = data.zaposleni[currName].prikazanoImeZap;
    } else {
        originalName = cell.originalName;
    }
    return originalName;
}

// pridobi full position zapis za tooltip (npr. "1,2,popoldne")
function get_fullPosition (cell) {
    return cell.position + "," + cell.smena;
}

// insert error/warrning for tooltip
function insert_errorWarrning_tooltipMessage (msg, fullPosition, msgType) {
    if (!allErrors[msgType][fullPosition]) {
        allErrors[msgType][fullPosition] = [];
    }
    
    allErrors[msgType][fullPosition].push(msg);
}

// preveri če je celica na posebnem oddelku (komentar, dopusti)
function isSpecialOddelek (cellData) {
    var oddelekId = Number.parseInt(cellData.oddelekId);

    var result;
    // pogledamo za dopoldne
    data.oddelki_dopoldne.forEach(element => {
        if (element.oddID === oddelekId) {
            if (element.specialOddelek === "") {
                result = false;
            }
            else {
                result = true;
            }
        }
    });
    // pogledamo za popoldne
    data.oddelki_popoldne.forEach(element => {
        if (element.oddID === oddelekId) {
            if (element.specialOddelek === "") {
                result = false;
            }
            else {
                result = true;
            }
        }
    });

    return result;
}

// pridobi oddelek type; komentar, "", ld,nn,boln;
function get_OddelekType (cellData) {
    var oddelekId = Number.parseInt(cellData.oddelekId);

    var result = "";
    // pogledamo za dopoldne
    data.oddelki_dopoldne.forEach(element => {
        if (element.oddID === oddelekId) {
            result = element.specialOddelek;
        }
    });
    // pogledamo za popoldne
    data.oddelki_popoldne.forEach(element => {
        if (element.oddID === oddelekId) {
            result = element.specialOddelek;
        }
    });

    return result;
}

// pridobi najmanjši/najzgodnejši čas pričetka osebe v dnevu in vrne celico s tem časom
function get_cell_minStartTime_forWorker_inDay (workerDayData) {
    // če ni vnosa vrnemo null
    if (workerDayData.length < 1) return null;

    var minTime = "";
    var minTimeCell = null;
    for (var i = 0; i < workerDayData.length; i++) {
        var cell = workerDayData[i];
        if (isSpecialOddelek(cell)) continue;

        var startTime = cell.startTime;

        if (minTime === "" || compare_times_is_time1_greaterThan_time2(minTime, startTime)) {
            minTime = startTime;
            minTimeCell = cell;
        }
    }

    // če nismo našli oddelka z časom
    if (minTime = "") {
        return null;
    }
    // drugače vrnemo celico z najmanšim začenim časom
    else {
        return minTimeCell;
    }
}

// pridobi največji/najkasnejši čas konca osebe v dnevu in vrne celico s tem časom
function get_cell_maxEndTime_forWorker_inDay (workerDayData) {
    // če ni vnosa vrnemo null
    if (workerDayData.length < 1) return null;

    var maxTime = "";
    var maxTimeInNextDay = false;
    var maxTimeCell = null;
    for (var i = 0; i < workerDayData.length; i++) {
        var cell = workerDayData[i];
        if (isSpecialOddelek(cell)) continue;

        var endTime = cell.endTime;
        var timeInNextDay = check_is_time2inNextDay(cell.startTime, endTime);

        if (maxTimeInNextDay && !timeInNextDay) continue;

        if (maxTime === "") {
            maxTime = endTime;
            maxTimeInNextDay = timeInNextDay;
            maxTimeCell = cell;
        }
        else if (timeInNextDay && !maxTimeInNextDay) {
            maxTime = endTime;
            maxTimeInNextDay = timeInNextDay;
            maxTimeCell = cell;
        } else if (compare_times_is_time1_greaterThan_time2(endTime, maxTime)) {
            maxTime = endTime;
            maxTimeInNextDay = timeInNextDay;
            maxTimeCell = cell;
        }
    }
    
    // če nismo našli oddelka z časom
    if (maxTime = "") {
        return null;
    }
    // drugače vrnemo celico z najmanšim začenim časom
    else {
        return maxTimeCell;
    }
}

// get time difference for 2 days next to each other
function get_timeDiference_between_TwoDays_inMinutes(maxEndTimeCell, minStartTimeCell) {
    var maxEndTime = "";
    var minStartTime = "";
    try {
        maxEndTime = maxEndTimeCell.endTime;
        minStartTime = minStartTimeCell.startTime;
    }
    catch (err) {
        console.log(err);
        
        return null;
    }

    var timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(maxEndTime, minStartTime);
    
    // popravimo čas če je potrebno
    var maxEndTimeInNextDay = check_is_time2inNextDay(maxEndTimeCell.startTime, maxEndTime);
    var maxEndTime_greaterThan_minStartTime = compare_times_is_time1_greaterThan_time2(maxEndTime, minStartTime);
    if (!maxEndTimeInNextDay && !maxEndTime_greaterThan_minStartTime) {
        timeDiff += 24 * 60;
    }
    else if (maxEndTimeInNextDay && maxEndTime_greaterThan_minStartTime) {
        timeDiff -= 24 * 60;
    }

    return timeDiff;
}