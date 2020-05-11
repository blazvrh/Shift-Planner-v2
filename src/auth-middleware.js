module.exports.authMiddleware = (req, res, next) => {
    next();

    // if (req.headers.host === "plan-dela.herokuapp.com") {
    //     next();
    // } else if (req.headers.host === "localhost:3000") {
    //     next();
    //     // res.status("401").json({ AccessDenied: "API accessible only through official domain!" });
    // } else {
    //     res.status("401").json({
    //         AccessDenied: "API accessible only through official domain!"
    //     });
    // }
}