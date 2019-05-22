
///
// preverimo če je zaposlen na seznamu vseh zaposlenih
///
function preveri_zaposlen_obstaja (weekData) {
    let names = Object.keys(weekData);

    names.forEach(name => {
        lowercaseName = name.toLowerCase();
        if(!(lowercaseName in data.prikazanaImena)) {
            let warnMsg = " - Oseba <strong><em>" + name + "</em></strong> ni vnešena v seznam zaposlenih." +
                " Za to osebo ne bo mogoče preveriti vseh pravil."

            // da vpišemo vsa mesta kjer je ta oseba
            weekData[name].forEach(cell => {
                // če smo na komentarju -> preskoči
                if (cell.oddelekName == "Komentarji") return;

                let smena = cell.smena;
                let pos = cell.position;
                let wholePos = pos + "," + smena;
                
                if (!allErrors.warnings[wholePos]) {
                    allErrors.warnings[wholePos] = [];
                }
    
                allErrors.warnings[wholePos].push(warnMsg);
            });
        }
    });
}

///
// preveri če je zaposlen usposobljen za oddelek
///
function preveri_zaposlen_usposobljenost(weekData) {

    let names = Object.keys(weekData);

    names.forEach(name => {
        lowercaseName = name.toLowerCase();
        // če ime obstaja v naši bazi zaposlenih
        if (lowercaseName in data.prikazanaImena) {
            // preveri za vsako celico
            weekData[name].forEach(cell => {
                // če smo na posebnem oddelku (komentar, dopusti ...) preskoči
                if (cell.oddelekName == "Komentarji" || cell.oddelekName == "ld.nn, boln.") return;

                let oddelekName = cell.oddelekName;
                let oddelekNameLowerCase = oddelekName.toLowerCase();
                let usposobljenostZaposlenega = data.zaposleni[lowercaseName].usposobljenostZap;
                // če ni usposobljen dodaj warning
                if (usposobljenostZaposlenega[oddelekNameLowerCase] == false) {
                    let warnMsg = " - Oseba <strong><em>" + name + "</em></strong> ni usposobljena za oddelek " +
                        "<strong><em>" + oddelekName + "</em></strong>";

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
    });
}