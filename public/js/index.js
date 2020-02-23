
window.onload = function() {
    // poiščemo vse update loge in jim dodamo puščice in onclick funkcijo
    let allUpdateHeaders = document.querySelectorAll("#rightMenu div h3");
    
    for (let i = 0; i < allUpdateHeaders.length; i++) {
        allUpdateHeaders[i].onclick = function () {
            hideShowUpdateLog(allUpdateHeaders[i]);
        }
        if (i === 0) {
            allUpdateHeaders[i].innerHTML += " &#11163;"
        }
        else {
            allUpdateHeaders[i].innerHTML += " &#11163;"    // dodamo puščico zato da dobimo presledek pred njo
            hideShowUpdateLog(allUpdateHeaders[i]);
        }
    }
    
    // dodamo lisener za štetje črk v predlogu
    document.getElementById("predlogi").onkeypress = function () {
        document.getElementById("predlogiCounter").innerHTML = String(this.value.length) + "/300";
    }

    // lisnener za gumb Submit predloga
    document.getElementById("submitPredlog").onclick = function () {
        submitPredlog();
    }
}

// hide/show update change log
function hideShowUpdateLog (headerElement) {
    let detailsElement = headerElement.parentNode.querySelector("ul");
    if (detailsElement.style.display == "none") {
        detailsElement.style.display = "block";
        headerElement.innerHTML = headerElement.innerHTML.slice(0,-1) + "&#11163;";
    }
    else {
        detailsElement.style.display = "none";
        headerElement.innerHTML = headerElement.innerHTML.slice(0,-1) + "&#11162;";
    }
}


function submitPredlog () {
    let predlogTxtElement = document.getElementById("predlogi");

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/predlogi"); 
    xhr.responseType = 'json';

    xhr.onload=function(event){ 
        let serverRes = event.target.response;
        if (isIE()) {
            serverRes = JSON.parse(serverRes);
        }
        
        // če je prišlo do napake, izpiši napako
        if (serverRes.isError) {
            document.getElementById("predlogServerResponse").innerHTML = serverRes.msg;
            // console.log(serverRes.msg);
            return;
        }
        // drugače počisti polja in posodobi tabelo
        else {
            
            predlogTxtElement.value = "";
            document.getElementById("predlogiCounter").innerHTML = "0/300";
            document.getElementById("predlogServerResponse").innerHTML = "Oddano";
        }
    }; 

    var formData = new FormData ();

    formData.append("predlogTxt", String(predlogTxtElement.value));
    
    xhr.send(formData);
}



const closeHeaderNotificationBtn = document.querySelector(".js-close-header-notification");
closeHeaderNotificationBtn.onclick = function() {
    document.querySelector(".js-header-notification").style.display = "none"
}
