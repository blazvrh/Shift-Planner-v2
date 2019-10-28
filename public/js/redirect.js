(function redirectToHttps () {
    // redirects from http to https if needed
    // self invoked
    // get curent url address
    const urlString = window.location.href;
    // stop if on localhost
    if (urlString.includes("localhost")) {
        return;
    }

    let urlStringSecure = "";
    
    // check if it is on http
    if (urlString.substr(0,4) === "http" && urlString.substr(0,5) !== "https") {
        urlStringSecure = urlString.replace("http", "https");
        window.location.href = urlStringSecure;
    }
}());