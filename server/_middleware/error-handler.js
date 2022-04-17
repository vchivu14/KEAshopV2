// This is a global handler and it is used to catch all errors and remove the need for redundant error handler code
//  throughout the application. It is configured as middleware in the main app.js file.

// By convention errors of type "string" are treated as custom (app specific errors), and this simplifies the code
//  for throwing custom errors since only a string needs to be thrown. (see the account service for some examples of custom errors)
// Errors are caught in the accounts controller for each route and passed to next(err) which passes them to this global error handler.
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