// potrebne knjižnice
const express = require("express");
const path = require("path");
const formData = require("express-form-data");

// vspostavi server
let app = express();
// določi pot za public mapo z html, css itd...
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html']
}));

// potrebno za parsanje POST requestov
const os = require("os");
const options = {
    uploadDir: os.tmpdir(),
    autoClean: true
};

// parse data with connect-multiparty. 
app.use(formData.parse(options));
// clear from the request and delete all empty files (size == 0)
app.use(formData.format());
// change file objects to stream.Readable 
app.use(formData.stream());
// union body and files
app.use(formData.union());

// routes
app.use(require("./routes/route_loginRegister"));
app.use(require("./routes/route_index"));
app.use("/oddelki", require("./routes/route_oddelki"));
app.use("/zaposleni", require("./routes/route_zaposleni"));
app.use("/urediTrenutenPlan", require("./routes/route_urediPlan"));


// vrne index če je url brez končnice ...
app.get ("/", () => {
    res.render("index");
});


// odpre server na portu 3000 oz local machine portu
let port = process.env.PORT || 3000;

app.enable('trust proxy');
app.use (function (req, res, next) {
    console.log("dass");
    
    if (req.secure) {
            // request was via https, so do no special handling
            next();
    } else {
            // request was via http, so redirect to https
            res.redirect('https://' + req.headers.host + req.url);
    }
});


app.listen(port, () => {
    console.log("lisening on port: " + port); 
});