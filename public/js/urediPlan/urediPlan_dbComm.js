
// pridobimo podatke o oddelkih
function submitForm_oddelekGet() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/oddelki/get");
    xhr.responseType = 'json';

    xhr.onload = function(event) {
        let serverRes = event.target.response;
        if (isIE()) { serverRes = JSON.parse(serverRes) }

        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // če je error zaradi nobenega vnosa
            if (serverRes.vsiOddelki == null) {
                // console.log("Ni oddelkov; Pohandlaj!!");
                error_onTableShow("<strong>Ni vnosa za oddeleke!</strong><br> &emsp;Pojdite na zavihek \"" +
                    "<a href='oddelki'>Urejanje oddelkov</a>\" in ustvarite primerne oddelke.");
            }
            // če je kak drugačen error
            else {
                console.log(serverRes.msg);
                error_onTableShow(serverRes.msg);
            }
            document.getElementById("btn_showWeek").style.display = "none";
        }
        else {
            // shranimo v storage
            let dopOddleki = [];
            let popOddleki = [];
            let oddById = { };

            serverRes.vsiOddelki.forEach(function(element) {
                if (element.smena == "dopoldne") {
                    dopOddleki.push(element);
                } else if (element.smena == "popoldne") {
                    popOddleki.push(element);
                }
                oddById[element.oddID] = element.imeOddelka;
            });
            // shranimo podatke
            // sessionStorage.setItem ("oddelki_dopoldne", JSON.stringify(dopOddleki));
            // sessionStorage.setItem ("oddelki_popoldne", JSON.stringify(popOddleki));

            data.oddelki_dopoldne = dopOddleki.sort(function(a, b) { return a.positionForUser > b.positionForUser ? 1 : -1});
            data.oddelki_popoldne = popOddleki.sort(function(a, b) { return a.positionForUser > b.positionForUser ? 1 : -1});
            data.oddById = oddById;
            document.getElementById("btn_showWeek").style.display = "inlineBlock";
        }
        submitForm_zaposleniGet();
    }; 
    var formData = new FormData ();

    formData.append("poslovalnica", userData.poslovalnica);
    xhr.send(formData);
}

// pridobimo podatke o zaposlenih
function submitForm_zaposleniGet() {
    var xhrGetZaposlene = new XMLHttpRequest();
    xhrGetZaposlene.open("POST", "/zaposleni/get");
    xhrGetZaposlene.responseType = 'json';

    xhrGetZaposlene.onload=function(event){ 
        let serverRes = event.target.response;
        if (isIE()) { serverRes = JSON.parse(serverRes) }
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // če je error zaradi nobenega vnosa
            if (serverRes.vsiZaposleni == null) {
                let prevMsg = document.getElementById("loadWeekError").innerHTML;
                prevMsg += prevMsg != "" ? "<br>" : "";
                
                error_onTableShow(prevMsg + "<strong>Ni vnosa za zaposlene!</strong><br> &emsp;Pojdite na zavihek \"" +
                "<a href='zaposleni'>Urejanje zaposlenih</a>\" in ustvarite zaposlene.");
            }
            // če je kak drugačen error
            else {
                console.log(serverRes.msg);
                error_onTableShow(serverRes.msg);
            }
        }
        else {
            
            let vsiZap = serverRes.vsiZaposleni

            for (let m = 0; m < serverRes.vsiZaposleni.length; m++) {                
                let usp = vsiZap[m].usposobljenostZap;
                // remove " on the start and end if there is one
                if (usp[0] === "\"") {
                    usp = usp.substr(1);
                }
                if (usp[usp.length - 1] === "\"") {
                    usp = usp.substring(0, usp.length - 1);
                }
                vsiZap[m].usposobljenostZap = JSON.parse(usp);
            }
            

            // pridobimo vsa prikazana imena
            let prikazanaImenaLowerCase = {};
            let prikazanaImena = {};
            // let prikazanaImena = [];
            vsiZap.forEach(function(element) {
                // prikazanaImena.push((element.prikazanoImeZap).toLowerCase());
                prikazanaImena[(element.prikazanoImeZap)] = element.zapID;
                prikazanaImenaLowerCase[(element.prikazanoImeZap).toLowerCase()] = element.zapID;
            });
            
            // shranimo v storage
            sessionStorage.setItem ("zaposleni", JSON.stringify(vsiZap));
            
            // tako da je key ime zaposlenega
            let newZaposleniObj = {};
            for (let i = 0; i < vsiZap.length; i++) {
                let zaposlen = vsiZap[i];
                newZaposleniObj[(zaposlen.prikazanoImeZap).toLowerCase()] = zaposlen;
            }
            
            data.zaposleni = newZaposleniObj;
            data.prikazanaImena = prikazanaImenaLowerCase;
            
            // nastavimo seznam (opcije) zapolenih
            set_options_forZaposlene (prikazanaImena);
        }
        // prikažemo dejansko stran
        showMainPageContent();
    }; 

    var formData = new FormData ();

    formData.append("poslovalnica", userData.poslovalnica);
    xhrGetZaposlene.send(formData);
}


// pridobimo podatke o trenutnem tednu
function submitForm_get_trenuenPlan() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/urediTrenutenPlan/get");
    xhr.responseType = 'json';

    xhr.onload = function(event) {
        let serverRes = event.target.response;
        if (isIE()) { serverRes = JSON.parse(serverRes) }

        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
           // če je error zaradi nobenega vnosa
           if (serverRes.weekData == null) {
               // ni podatka za ta teden; pošljemo prazen objekt
               fill_table_withDbData({});
               
                // submitForm_get_lastWeekPlan();
            }
            // če je kak drugačen error
            else {
                console.log(serverRes.msg);
                console.log("IZPIŠI ERROR UPORABNIKU");
            }
        }
        else {
            fill_table_withDbData(JSON.parse(serverRes.weekData.weekData));
            set_praznikDneve(serverRes.weekData.praznikiData);
        }
        submitForm_get_sundaysInThisYear();
    }; 

    var formData = new FormData ();

    formData.append("poslovalnica", userData.poslovalnica);
    formData.append("weekNum", currDateData.selectedWeekNumber);
    formData.append("year", currDateData.selectedMondayDate.getFullYear());
    
    xhr.send(formData);
}

// pridobimo podatke nedeljah v letu
function submitForm_get_sundaysInThisYear() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/urediTrenutenPlan/sundaysYear");
    xhr.responseType = 'json';

    xhr.onload = function(event) {
        let serverRes = event.target.response;
        if (isIE()) { serverRes = JSON.parse(serverRes) }

        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // izpiši error
            console.log(serverRes.msg);
            console.log("IZPIŠI ERROR UPORABNIKU");
        }
        else {
            create_sundayData_byWorker(serverRes.allSundays);
        }
        submitForm_get_holidaysInThisYear();
    }

    var formData = new FormData ();

    let sundayDate = new Date(currDateData.selectedMondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);

    formData.append("poslovalnica", userData.poslovalnica);
    formData.append("sundayYear", sundayDate.getFullYear());
    
    xhr.send(formData);
}

// pridobimo podatke o praznikih v letu
function submitForm_get_holidaysInThisYear() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/urediTrenutenPlan/holidaysYear");
    xhr.responseType = 'json';

    xhr.onload = function(event) {
        let serverRes = event.target.response;
        if (isIE()) { serverRes = JSON.parse(serverRes) }

        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // izpiši error
            console.log(serverRes.msg);
            console.log("IZPIŠI ERROR UPORABNIKU");
        }
        else {
            create_holidayData_byWorker(serverRes.allHolidays);
        }
        submitForm_get_lastWeekPlan();
    }

    var formData = new FormData ();

    formData.append("poslovalnica", userData.poslovalnica);
    formData.append("year", currDateData.selectedMondayDate.getFullYear());
    
    xhr.send(formData);
}


// pridobimo podatke o prejšnem tednu
function submitForm_get_lastWeekPlan() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/urediTrenutenPlan/get");
    xhr.responseType = 'json';

    xhr.onload = function(event) {
        let serverRes = event.target.response;
        if (isIE()) { serverRes = JSON.parse(serverRes) }
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
           // če je error zaradi nobenega vnosa
           if (serverRes.weekData == null) {
               // ni podatka za ta teden; pošljemo prazen objekt
               data.prevWeekData = null;

               btn_check_currPlan();
               document.getElementById("tableZaPlan").style.display = "block";
            }
            // če je kak drugačen error
            else {
                console.log(serverRes.msg);
                console.log("IZPIŠI ERROR UPORABNIKU");
            }
        }
        else {
            let prevWeekData = get_currPlan_Worker_dayOriented(JSON.parse(serverRes.weekData.weekData));
            // pridobimo še nedeljo pred tem
            if (serverRes.prevWeekData != null) {
                let prev2WeekData = get_currPlan_Worker_dayOriented(JSON.parse(serverRes.prevWeekData.weekData));
                
                let prev2Names = Object.keys(prev2WeekData);
                prev2Names.forEach(function(name) {
                    if (prev2WeekData[name][7].length > 0 && prevWeekData[name] != null) {
                        prevWeekData[name][0] = prev2WeekData[name][7];

                        // popravimo day index na 0
                        const keys = Object.keys(prevWeekData[name][0]);
                        keys.forEach(function(key) {
                            prevWeekData[name][0][key].dayIndex = "0"; 
                        });
                    }
                });
            }
                
            data.prevWeekData = prevWeekData;

            btn_check_currPlan();

            document.getElementById("tableZaPlan").style.display = "block";
        }
        window.location.href ="#creationTable";
        
        buttonElements.btn_showWeek.disabled = false;
        
        document.getElementById("saveDoneIndicator").src = "images/kljukica.png";
    }

    var formData = new FormData ();

    let lastMondayDate = new Date(currDateData.selectedMondayDate);
    lastMondayDate.setDate(lastMondayDate.getDate() - 7);

    formData.append("poslovalnica", userData.poslovalnica);
    formData.append("weekNum", get_weekNumber_fromDate(lastMondayDate));
    formData.append("year", lastMondayDate.getFullYear());
    formData.append("getPrevSunday", "true");
    
    xhr.send(formData);
}

// shrani trenutni plan
function submitForm_save_trenuenPlan(weekNum, year, mondayDate, tableData, sundayData, praznikiData) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/urediTrenutenPlan/save"); 
    xhr.responseType = 'json';

    xhr.onload=function(event){ 
        let serverRes = event.target.response;
        if (isIE()) { serverRes = JSON.parse(serverRes) }
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            // onInputErrorOddelki(serverRes.msg);
            alert(serverRes.msg);
            buttonElements.saveCurrPlan.disabled = false;
            
            return;
        }
        else {
            buttonElements.saveCurrPlan.disabled = false;
            document.getElementById("saveDoneIndicator").src = "images/kljukica.png";
            dataSaved = true;
        }
    }; 

    var formData = new FormData ();

    formData.append("oddelkiDop", JSON.stringify(data.oddelki_dopoldne));
    formData.append("oddelkiPop", JSON.stringify(data.oddelki_popoldne));
    formData.append("poslovalnica", userData.poslovalnica);
    formData.append("weekNum", weekNum);
    formData.append("year", year);
    formData.append("mondayDate", mondayDate);
    formData.append("tableData", JSON.stringify(tableData));
    formData.append("sundayData", JSON.stringify(sundayData));
    formData.append("praznikiData", JSON.stringify(praznikiData));

    xhr.send(formData);
}