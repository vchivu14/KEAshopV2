// ENTRY POINT TO OUR APPLICATION
//  configures appliation middleware, binds controllers to routes and starts the Express web server.

require("dotenv").config();
// Using this module you just need to remember your own project directory structure and 
//  make all require absolute to the project root directory
require("rootpath")();

const express = require("express");
const path = require("path");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const errorHandler = require('./_middleware/error-handler');
const rateLimit = require("express-rate-limit");
const dbo = require("./_db/connection.js");

const app = express();

app.get("/", (req, res) => {
    res.sendFile( path.join(__dirname, "svelte", "public", "index.html") )
});

app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use("/auth", require("./session/test"));

app.use(require("./products/routes"));

const baseLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(baseLimiter);

app.use("/accounts", require("./accounts/accounts.controller"));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// perform the database connection when the server starts
dbo.connectToServer(function (err) {
    if (err) {
        console.log(err);
        process.exit();
    }

    app.listen(PORT, () => {
        console.log("Starting server on port: ", PORT);
    });
});