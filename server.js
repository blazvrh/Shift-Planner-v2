// potrebne knjižnice
const express = require("express");
const path = require("path");
const formData = require("express-form-data");

const authMiddleware = require("./src/auth-middleware")

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

// check domain
// app.use("")

app.use("/api/stay-awake", (req, res, next) => {
    // Prevent render.com application to go to sleep while on the page
    res.status(200).json({
        status: 200,
        message: "Pinged."
    })
});

app.use(authMiddleware.authMiddleware, require("./routes/route_loginRegister"));
app.use(authMiddleware.authMiddleware, require("./routes/route_index"));
app.use("/oddelki", authMiddleware.authMiddleware, require("./routes/route_oddelki"));
app.use("/zaposleni", authMiddleware.authMiddleware, require("./routes/route_zaposleni"));
app.use("/urediTrenutenPlan", authMiddleware.authMiddleware, require("./routes/route_urediPlan"));


// vrne index če je url brez končnice ...
app.get("/", () => {
    res.render("index");
});


// odpre server na portu 3000 oz local machine portu
let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("lisening on port: " + port);
});