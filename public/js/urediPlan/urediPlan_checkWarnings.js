
///
// preverimo če je zaposlen na seznamu vseh zaposlenih
///
function preveri_zaposlen_obstaja (weekData) {
    let names = Object.keys(weekData);

    names.forEach(name => {
        if(!(name in data.prikazanaImena)) {
            // da vpišemo vsa mesta kjer je ta oseba
            for (let i = 1; i < 8; i++) {
                weekData[name][i].forEach(cell => {
                    // če smo na komentarju -> preskoči
                    if (cell.oddelekName == "Komentarji") return;

                    let smena = cell.smena;
                    let pos = cell.position;
                    let wholePos = pos + "," + smena;
                    let originalName = cell.originalName;
                    
                    if (!allErrors.warnings[wholePos]) {
                        allErrors.warnings[wholePos] = [];
                    }

                    let warnMsg = " - Oseba <strong><em>" + originalName + "</em></strong> ni vnešena v seznam zaposlenih." +
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
    let names = Object.keys(weekData);

    names.forEach(name => {
        // če ime obstaja v naši bazi zaposlenih
        if (name in data.prikazanaImena) {
            // preveri za vsako celico
            for (let i = 1; i < 8; i++) {
                weekData[name][i].forEach(cell => {
                    // če smo na posebnem oddelku (komentar, dopusti ...) preskoči
                    if (cell.oddelekName == "Komentarji" || cell.oddelekName == "ld.nn, boln.") return;

                    let oddelekName = cell.oddelekName;
                    let oddelekNameLowerCase = oddelekName.toLowerCase();
                    let usposobljenostZaposlenega = data.zaposleni[name].usposobljenostZap;
                    // če ni usposobljen dodaj warning
                    if (usposobljenostZaposlenega[oddelekNameLowerCase] == false) {
                        let warnMsg = " - Oseba <strong><em>" + data.zaposleni[name].prikazanoImeZap + 
                            "</em></strong> ni usposobljena za oddelek <strong><em>" 
                            + oddelekName + "</em></strong>!";

                        let smena = cell.smena;
                        let pos = cell.position;
                        let wholePos = pos + "," + smena;
                        
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

    let warnNames = []; // imena ki so delala že prejšnjo nedeljo

    let nameKeys = Object.keys(currWeekData);
    nameKeys.forEach(name => {
        // nadaljuj samo če oseba dela v nedeljo v tem tednu
        if (currWeekData[name][7].length < 1) return;

        let dayData = currWeekData[name][7];
        
        for (let i = 0; i < dayData.length; i++) {
            if (dayData[i].oddelekName === "Komentarji" || dayData[i].oddelekName === "ld.nn, boln.") {
                continue;
            }

            try {
                let prevWeekDayData = prevWeekData[name][7];
                for (let j = 0; j < prevWeekDayData.length; j++) {
                    if (prevWeekDayData[i].oddelekName === "Komentarji" || prevWeekDayData[i].oddelekName === "ld.nn, boln.") {
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
        let dayData = currWeekData[name][7];
        for (let i = 0; i < dayData.length; i++) {
            if (dayData[i].oddelekName === "Komentarji" || dayData[i].oddelekName === "ld.nn, boln.") {
                continue;
            }

            let wholePos = dayData[i].position + "," + dayData[i].smena;
            let originalName = "";
            if (data.zaposleni[name] != null) {
                originalName = data.zaposleni[name].prikazanoImeZap;
            } else {
                originalName = dayData[i].originalName;
            }

            let warnMsg = " - Oseba <strong><em>" + originalName + 
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
function preveri_tedenskiPocitek_zaPrejsnjoNedeljo (prevWeekData, currWeekData) {
    // če ni podatka za prejšnji teden končaj
    if (prevWeekData === null || Object.keys(prevWeekData).length < 1) return;

    const currWeekNames = Object.keys(currWeekData);
    const prevWeekNames = Object.keys(prevWeekData);

    currWeekNames.forEach(name => {
        if (!(prevWeekNames.includes(name))) return;

        const sundayTime = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][7]);
        const maxEndTime = get_cell_maxEndTime_forWorker_inDay(prevWeekData[name][6]);
        const minStartTime = get_cell_minStartTime_forWorker_inDay(currWeekData[name][1]);

        if (sundayTime != null || maxEndTime === null || minStartTime === null) return;


        const endTimeInNextDay = check_is_time2inNextDay(maxEndTime.startTime, maxEndTime.endTime);
        const satTime = maxEndTime.endTime;
        const monTime = minStartTime.startTime;

        let timeDiff = get_timeDifference_inMinutes_betweenTwoTimes(satTime, monTime);

        const saturdayTimeBigerThanMondayTime = compare_times_is_time1_greaterThan_time2(satTime, monTime)
        
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
            const originalName = get_originalName(name, minStartTime);
            let pocitekTimeString = Number.parseInt(timeDiff / 60).toString() + " ur " + (timeDiff % 60).toString() + " min";
            let warnMsg = " - Počitek od sobote do ponedeljka za osebo <strong><em>" + originalName + "</em></strong>" +
                " ni dovolj dolg, da bi nedelja služila kot prost dan!" +
                "<br>&emsp;Zagotovljen počitek: <strong>" + pocitekTimeString + "</strong>" +
                "<br>&emsp;Potreben počitek: <strong>" + (dnevniPocitek + 24).toString() + " ur</strong>";

            insert_errorWarrning_tooltipMessage(warnMsg, get_fullPosition(minStartTime), "warnings");
        }
    });
}