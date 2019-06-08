
window.addEventListener('load', () => {
    pageInit();
});

// dodajanje lisenerjev in podobno
function pageInit () {
    // izberemo trenuten teden
    izberiCelotenTeden();
    
    // lisener za spremembo tedna btn (-1)
    document.getElementById("week_reduce").onclick = function() { btn_changeWeekByOne(-1); }
    // lisener za spremembo tedna btn (+1)
    document.getElementById("week_increse").onclick = function() { btn_changeWeekByOne(1); }
    // lisener za spremembo tedna z input fieldom
    document.getElementById("inp_izberiDatum").onchange = function() { izberiCelotenTeden(this.value); }
    // lisener za prikaži teden btn
    document.getElementById("btn_showWeek").onclick = function() { btn_ShowSelectedWeek(); }

}

// prikaže tabelo plana za izbran teden
function btn_ShowSelectedWeek() {
    document.getElementById("planDelaIzbranTedenDiv").innerHTML = "<h3>Nalaganje ...</h3>";
    submitForm_get_trenuenPlan();    
}

function create_preview_SelectedWeek(weekData, oddDop, oddPop) {
    create_table_selectedWeek (weekData, oddDop, oddPop);    
}


function printPlan() {

    var mywindow = window.open('', 'Print');

    mywindow.document.write('<html lang="en"><head>');
    mywindow.document.write(document.head.innerHTML);
    // mywindow.document.write('<style type="text/css" media="print">@page { size: landscape; }</style>');
    mywindow.document.write('</head><body><div id="printArea">');
    mywindow.document.write(document.getElementById("planDelaIzbranTedenDiv").innerHTML);
    mywindow.document.write('</div><script type="text/javascript">' + 
        "window.onload = function() { window.print(); window.close(); }" + 
        '</script></body></html>');

    mywindow.document.title = "Plan dela - " + userData.poslovalnica;
    mywindow.document.close();
    mywindow.focus();
    return true;
}