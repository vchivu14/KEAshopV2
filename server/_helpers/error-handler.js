// This is a global handler and it is used to catch all errors and remove the need for redundant error handler code
//  throughout the application. It is configured as middleware in the main server.js file.

module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === "string") {
        //custom application error
        return res.status(400).json({ message: err });
    }

    if (err.name === "UnathorizedError") {
        //jwt authentication error
        return res.status(401).json({ message: "Invalid Token" });
    }

    //default to 500 server error
    return res.status(500).json({ message: err.message });
}