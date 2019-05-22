
///
// preveri če obstaja prekrivanje časov v istem dnevu za osebo
///
function preveri_cas_prekrivanje (weekData) {
    let allNames = Object.keys(weekData);

    allNames.forEach(name => {
        let workerData = get_currPlan_worker_dayOriented(weekData[name]);
        
        let dayKeys = Object.keys(workerData);
        dayKeys.forEach(dayKey => {
            let dayData = workerData[dayKey];
            // če sta manj kot 2 vnosa, prekrivanje ni možno
            if (dayData.length < 2) { return; }
            
            let dayCellErrors = [];
            // primerjamo končni čas vsakega elemeta z začetnim časom vsakega elementa
            // zadnjega ne rabimo več pregledovati ker smo ga primerjali že vsemi drugimi
            for (let i = 0; i < dayData.length - 1; i++) {
                let firstCell = dayData[i];
                if (firstCell.oddelekName == "Komentarji" || firstCell.oddelekName == "ld.nn, boln.") {
                    continue;
                }
                for (let j = i + 1; j < dayData.length; j++) {
                    let secondCell = dayData[j];
                    if (secondCell.oddelekName == "Komentarji" || secondCell.oddelekName == "ld.nn, boln.") {
                        continue;
                    }

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
            
            let errMsg = " - Zaznano prekrivanje delovnega časa za osebo <strong><em>" + name + 
            "</em></strong> na oddelkih: <strong><em>" + oddelkiSPrekrivanjemArr.join(", ") + "</em></strong>";
            
            fullTooltipPositions.forEach(fullPosition => {
                if (!allErrors.errors[fullPosition]) {
                    allErrors.errors[fullPosition] = [];
                }
    
                allErrors.errors[fullPosition].push(errMsg);
            });
        });
    });
}

///
// preveri tedenski delovni čas
//
function preveri_cas_tedenskiMax (weekData) {
    let allNames = Object.keys(weekData);

    allNames.forEach(name => {
        if (!(name.toLowerCase() in data.zaposleni)) return;

        let workerData = weekData[name];
        let totalWorkingMin = 0;

        for (let cellIndex = 0; cellIndex < workerData.length; cellIndex++) {
            let startTime = workerData[cellIndex].startTime;
            let endTime = workerData[cellIndex].endTime;
            totalWorkingMin += get_timeDifference_inMinutes_betweenTwoTimes(startTime, endTime);
        }

        let maxUrNaTeden = data.zaposleni[name.toLowerCase()].maxUrTedenZap;
        
        if (totalWorkingMin > maxUrNaTeden * 60) {
            let opravljeneUre = Number.parseInt(totalWorkingMin / 60);
            let opravljeneMinute = totalWorkingMin % 60;
            let opravljenČas = opravljeneUre.toString() + " ur";
            opravljenČas += opravljeneMinute > 0 ? " " + opravljeneMinute.toString() + " min" : "";

            let errMsg = " - Prekoračen tedenski deovni čas za osebo <strong><em>" + name + "</em></strong>!" +
                "<br>&emsp;Opravil: <strong>" + opravljenČas + "</strong>" +
                "<br>&emsp;Dovoljeno: <strong>" + maxUrNaTeden + " ur</strong>";

            for (let cellIndex = 0; cellIndex < workerData.length; cellIndex++) {
                let fullPosition = workerData[cellIndex].position + "," + workerData[cellIndex].smena;
                if (!allErrors.errors[fullPosition]) {
                    allErrors.errors[fullPosition] = [];
                }
    
                allErrors.errors[fullPosition].push(errMsg);
            }
        }
    });
}

///
// preveri dnevni delovni čas
//
function preveri_cas_dnevniMax (weekData) {
    let allNames = Object.keys(weekData);

    allNames.forEach(name => {
        if (!(name.toLowerCase() in data.zaposleni)) return;

        let workerData = get_currPlan_worker_dayOriented(weekData[name]);
        
        let dayKeys = Object.keys(workerData);
        dayKeys.forEach(dayKey => {
            let dayData = workerData[dayKey];
            let totalWorkingMin = 0;

            for (let i = 0; i < dayData.length; i++) {
                let startTime = dayData[i].startTime;
                let endTime = dayData[i].endTime;
                totalWorkingMin += get_timeDifference_inMinutes_betweenTwoTimes(startTime, endTime); 
            }
            
            let maxUrNaDan = data.zaposleni[name.toLowerCase()].maxUrDanZap;

            
            if (totalWorkingMin > maxUrNaDan * 60) {
                let opravljeneUre = Number.parseInt(totalWorkingMin / 60);
                let opravljeneMinute = totalWorkingMin % 60;
                let opravljenČas = opravljeneUre.toString() + " ur";
                opravljenČas += opravljeneMinute > 0 ? " " + opravljeneMinute.toString() + " min" : "";

                let errMsg = " - Prekoračen dnevni deovni čas za osebo <strong><em>" + name + "</em></strong>!" +
                    "<br>&emsp;Opravil: <strong>" + opravljenČas + "</strong>" +
                    "<br>&emsp;Dovoljeno: <strong>" + maxUrNaDan + " ur</strong>";

                for (let cellIndex = 0; cellIndex < dayData.length; cellIndex++) {
                    let fullPosition = dayData[cellIndex].position + "," + dayData[cellIndex].smena;
                    if (!allErrors.errors[fullPosition]) {
                        allErrors.errors[fullPosition] = [];
                    }
        
                    allErrors.errors[fullPosition].push(errMsg);
                }
        }
            


        });
    });

}