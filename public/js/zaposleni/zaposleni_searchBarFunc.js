
function startSearch () {
    let userInput = document.getElementById("searchBarInput").value;
    if (userInput.length > 0) {
        searchAndShowResults(userInput); 
    }
}

function searchAndShowResults (userInput) {
    var searchReg = new RegExp("");

    // iskane nize ločimo s presledkom
    const allSearchValues = userInput.split(" ");

    for (let rowIndex = 0; rowIndex < tableObjectsAndNames.length; rowIndex++) {
        const rowStringVal = tableObjectsAndNames[rowIndex].names;
        // ali smo našli vse potrebne iskane vrednosti
        let isMatch = true;

        for (let i = 0; i < allSearchValues.length; i++) {
            const currVall = allSearchValues[i].toLowerCase();
            if (currVall.length < 1) continue;
            // nastavimo vrednost izraza
            searchReg = currVall;

            if (rowStringVal.match(searchReg) == null) {
                isMatch = false;
            }
        }

        if(isMatch === true) {
            tableObjectsAndNames[rowIndex].element.style.display = "";
        }
        else {
            tableObjectsAndNames[rowIndex].element.style.display = "none";
        }
    }
}

function cancel_Search () {
    for (let rowIndex = 0; rowIndex < tableObjectsAndNames.length; rowIndex++) {
        tableObjectsAndNames[rowIndex].element.style.display = "";
    }
    document.getElementById("searchBarInput").value = "";
}