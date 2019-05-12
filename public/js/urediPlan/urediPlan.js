
var prikazanaImenaVsa = [];


// 
window.addEventListener('load', () => {
    submitForm_oddelekGet();

});

function showMainPageContent (prikazanaImena) {
    document.getElementById("loadingData").style.display = "none";
    document.getElementById("mainPageContent").style.display = "initial";
    prikazanaImenaVsa = prikazanaImena;

    console.log(prikazanaImenaVsa);
    
}