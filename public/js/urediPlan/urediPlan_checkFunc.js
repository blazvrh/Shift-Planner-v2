
// poišče originalno ime za celico
function get_originalName (currName, cell) {
    let originalName = "";
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
    if (cellData.oddelekName === "Komentarji" || cellData.oddelekName === "ld.nn, boln.") {
        return true;
    } else {
        return false;
    }
}

// pridobi najmanjši/najzgodnejši čas pričetka osebe v dnevu in vrne celico s tem časom
function get_cell_minStartTime_forWorker_inDay (workerDayData) {
    // če ni vnosa vrnemo null
    if (workerDayData.length < 1) return null;

    let minTime = "";
    let minTimeCell = null;
    for (let i = 0; i < workerDayData.length; i++) {
        let cell = workerDayData[i];
        if (isSpecialOddelek(cell)) continue;

        let startTime = cell.startTime;

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

    let maxTime = "";
    let maxTimeInNextDay = false;
    let maxTimeCell = null;
    for (let i = 0; i < workerDayData.length; i++) {
        let cell = workerDayData[i];
        if (isSpecialOddelek(cell)) continue;

        let endTime = cell.endTime;
        let timeInNextDay = check_is_time2inNextDay(cell.startTime, endTime);

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
    let maxEndTime = "";
    let minStartTime = "";
    try {
        maxEndTime = maxEndTimeCell.endTime;
        minStartTime = minStartTimeCell.startTime;
    }
    catch (err) {
        console.log(err);
        
        return null;
    }

    let timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(maxEndTime, minStartTime);
    
    // popravimo čas če je potrebno
    const maxEndTimeInNextDay = check_is_time2inNextDay(maxEndTimeCell.startTime, maxEndTime);
    const maxEndTime_greaterThan_minStartTime = compare_times_is_time1_greaterThan_time2(maxEndTime, minStartTime);
    if (!maxEndTimeInNextDay && !maxEndTime_greaterThan_minStartTime) {
        timeDiff += 24 * 60;
    }
    else if (maxEndTimeInNextDay && maxEndTime_greaterThan_minStartTime) {
        timeDiff -= 24 * 60;
    }

    return timeDiff;
}