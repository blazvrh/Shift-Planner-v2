
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
// preveri če ima oseba dodaten prost dan po delovni nedelji
///
function preveri_prostDan_poDelovniNedelji (prevWeekData, currWeekData) {
    // če ni podatka za prejšnji teden končaj
    if (prevWeekData === null || Object.keys(prevWeekData).length < 1) return;

    // ustvarimo array vseh delavcev ki so delali prejšnjo nedeljo
    let sundayWorkers = [];
    let prevWeekNames = Object.keys(prevWeekData);
    prevWeekNames.forEach(name => {
        for (let i = 0; i < prevWeekData[name][7].length; i++) {
            let cell = prevWeekData[name][7][i];
            if (isSpecialOddelek(cell)) {
                continue;
            } else {
                sundayWorkers.push(name);
            }
        }
    });

    let nameKeys = Object.keys(currWeekData);
    nameKeys.forEach(name => {
        if (!(sundayWorkers.includes(name))) return;
        
        let hasFreeDay = false;
        for (let dayIndex = 1; dayIndex < 7; dayIndex++) {
            let isFreeOnThisDay = true;
            for (let i = 0; i < currWeekData[name][dayIndex].length; i++) {
                let cell = currWeekData[name][dayIndex][i];
                if (isSpecialOddelek(cell)) {
                    continue;
                } else {
                    isFreeOnThisDay = false;
                    break;
                }
            }
            if (isFreeOnThisDay) {
                hasFreeDay = true;
                break;
            }
        }

        // če nima prostega dneva potem izpiši opozorilo
        if (!hasFreeDay) {
            for (let dayIndex = 1; dayIndex < 7; dayIndex++) {
                for (let i = 0; i < currWeekData[name][dayIndex].length; i++) {
                    let cell = currWeekData[name][dayIndex][i];
                    if (isSpecialOddelek(cell)) continue;

                    let wholePos = cell.position + "," + cell.smena;
                    let originalName = "";
                    if (data.zaposleni[name] != null) {
                        originalName = data.zaposleni[name].prikazanoImeZap;
                    } else {
                        originalName = cell.originalName;
                    }

                    let warnMsg = " - Potreben dodaten <strog>prost dan</strong> po delovni nedelji za osebo <strong><em>" 
                        + originalName + "</em></strong>?";

                    if (!allErrors.warnings[wholePos]) {
                        allErrors.warnings[wholePos] = [];
                    }

                    allErrors.warnings[wholePos].push(warnMsg);
                }
            }
        } 
    });
}