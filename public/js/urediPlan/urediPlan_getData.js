
var userUID;

var inp_izberiDatum = document.getElementById("inp_izberiDatum");
var txt_stTedna = document.getElementById("txt_stTedna");

var tr_mainPlan_header = document.getElementById("tr_mainPlan_header");

// gumb za skakanje po tednu za eno gor/dol
function changeWeekByOne (mulitplier) {
    var datum = new Date(inp_izberiDatum.value);
    datum.setDate(datum.getDate() + (7 * mulitplier));
    inp_izberiDatum.value = convertDateToString(datum);
    izberiCelotenTeden(datum);
}

// iz podanega datuma poišče ponedljek in nedeljo ter št. tedna
function izberiCelotenTeden (d) {
    var inp_tedenZacetek = document.getElementById("datum_zacetek");
    var inp_tedenKonec = document.getElementById("datum_konec");

    let currDate = new Date();
    if (d) {
        currDate = new Date(d);
    }
    else {
        inp_izberiDatum.value = convertDateToString(currDate);
    }
    
    let dayOfWeek = currDate.getDay();
    if (dayOfWeek == 0) dayOfWeek = 7;
    
    let weekNumber = currDate.getWeek();
    
    let zacetekDate = new Date(currDate);
    zacetekDate.setDate(zacetekDate.getDate() - dayOfWeek + 1);
    let konecDate = new Date(currDate);
    konecDate.setDate(konecDate.getDate() + (7 - dayOfWeek));

    zacetekDateString = new Date(zacetekDate).toLocaleString('sl-SI',{day: "numeric", month: "long", year: "numeric"});
    konecDateString = new Date(konecDate).toLocaleString('sl-SI',{day: "numeric", month: "long", year: "numeric"});
    
    inp_tedenZacetek.innerText = zacetekDateString;
    inp_tedenKonec.innerText = konecDateString;
    txt_stTedna.innerText = weekNumber;
    
    setNecessaryVariables (weekNumber, zacetekDate);
}

// magic prekopiran z neta
Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

// pretvori datum v string ki ga lahko izpišemo v input[type="date"]
function convertDateToString(d) {
    let dd = d.getDate();
    let mm = d.getMonth() + 1;
    let yyyy = d.getFullYear();

    let dateString = [yyyy.toString(), "-",
        (mm > 9 ? '' : '0') + mm.toString(), "-",
        (dd > 9 ? '' : '0') + dd.toString()
    ].join('');
    
    return dateString;
}

// // pridobi informacije o oddelkih
// function getOddelekDataFromFirebase (smena) {
//     var firebaseRef = firebase.database().ref().child("users").child(userUID).
//         child("oddelki").child(smena);
        
//         firebaseRef.once("value", (snapData) => {
//         let oddelek = {};
//         let vsiOddelki = [];
        
//         snapData.forEach(element => {
//             oddelek = {
//                 key: element.key,
//                 imeOddelka: element.child("imeOddelka").val(),
//                 stVrsticOddelka: element.child("stVrsticOddelka").val(),
//                 prihodNaOddelek: element.child("prihodNaOddelek").val(),
//                 odhodIzOddelka: element.child("odhodIzOddelka").val(),
//                 specialOddelek: element.child("specialOddelek").val()
//             }
//             vsiOddelki.push(oddelek);
//         });
//         let storageFormat = JSON.stringify(vsiOddelki);
//         sessionStorage.setItem ("oddelki_" + smena, storageFormat);

//         dataToCheck --;
//     });
    
// }

// // // pridobi ime poslovalnice
// // function getPoslovalnicaFromFirebase (user) {
// //     let poslovalnica = user.displayName;
// //     sessionStorage.setItem("poslovalnica", poslovalnica);

// //     showRestOfBody();
// //     dataToCheck --;
// // }

// // // var dataToCheck = 3;

// // // // pridobi vse potrebne podatke
// // // function checkForData (user) {
    
// // //     if (sessionStorage.getItem("poslovalnica") == null) {
// // //         getPoslovalnicaFromFirebase(user);
// // //     } else {
// // //         dataToCheck --;
// // //     }
// // //     if (sessionStorage.getItem("oddelki_dopoldne") == null) {
// // //         getOddelekDataFromFirebase ("dopoldne");
// // //     } else {
// // //         dataToCheck --;
// // //     }
// // //     if (sessionStorage.getItem("oddelki_popoldne") == null) {
// // //         getOddelekDataFromFirebase ("popoldne");
// // //     } else {
// // //         dataToCheck --;
// // //     }
    
// // //         // poišči zaposlene

// // //         // poišči potrebne podatke iz starih planov

// // //         // izpiši morebiten trenuten plan
        

// // //     // počakamo na potrebne podatke
// // //     var waitForNececceryData = setInterval(() => {
// // //         if (dataToCheck == 0) {
// // //             // popravimo datum v izbiri tedna
// // //             izberiCelotenTeden();

// // //             // prikažemo dejansko stran
// // //             let loadingDataDiv = document.getElementById("loadingData");
// // //             let mainDiv = document.getElementById("mainDiv");

// // //             loadingDataDiv.style.display = "none";
// // //             mainDiv.style.display = "initial";

// // //             clearInterval(waitForNececceryData);
// // //         }
// // //     }, 300);
// // // }

// // // // počaka da se firebase vspostavi in nato shrani user id
// // // var checkForFirebaseConn = setInterval(() => {

// // //     var userInst = firebase.auth().currentUser;

// // //     if(userInst) {
// // //         userUID = userInst.uid;

// // //         checkForData(userInst);

// // //         clearInterval(checkForFirebaseConn);
// // //     }
// // // }, 300);