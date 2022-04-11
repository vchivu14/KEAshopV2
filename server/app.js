require("dotenv").config();
require("rootpath")();

const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const session = require("express-session");

const cors = require("cors");

const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');

// const dbName = process.env.DB_NAME;
// const dbConn = require("./db/conn.js");
const dbo = require("./db/connection.js");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(jwt());

app.use("/users", require("./users/users.controller"));
app.use(errorHandler);

app.use(require("./routes/routes"));

const baseLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 25, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// app.use(helmet());
app.use(baseLimiter);
app.use("/auth", authLimiter);

app.get("/", (req, res) => {
    if (!req.session) {
        res.send("No authentication required")
    }  
});

const session_options = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {} 
}
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(session(session_options));

app.post("/auth/login", async (req, res, next) => {
    // console.log("someone hit me")
    res.set('Content-Type', 'application/json');
    // if (req.body.email==="foo@foo" && req.body.password==="bar@Bar1") {
    //     res.locals.email = req.body.email
    //     next()
    // } else res.status(401).send("Unathorized");
    let {email, password} = req.body;
    console.log(email);
    console.log(typeof(email));
    const _db = await dbConn.get(dbName);
    _db
        .collection("users")
        .find({ email: email })
        .toArray(function (err, result) {
            if (err) {
                res.status(400).send("No such email! Please try again.")
            } else {
                console.log(result);
                res.json(result);
            }
        });
},
    (req, res) => {
        req.session.loggedIn = true;
        req.session.email = res.locals.email
        res.send({ Profile: res.locals.email })
    }
);

app.get("/home", (req, res) => {
    console.log(req.session.user);
    res.send("You're in");
})

app.get("/authenticated", (req, res) => {
    // req.session.views should check if user was logged in
    if (req.session.views) {
        console.log(req.session.views);
        console.log(req.sessionID);
        if (req.ip !== req.session.ip) {
            res.end("Session was destroyed because ip change, please login again");
            req.session.destroy();
        }
        else {
            req.session.views++
            req.session.isAuthenticated = true;
            req.session.user = "vlad"            
            res.setHeader('Content-Type', 'text/html');
            res.write('<p>views: ' + req.session.views + '</p>');
            res.write('<p>cookie is: ' + req.session.cookie + '</p>');
            res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>');
            res.write('<p>is authenticated?: ' + req.session.isAuthenticated + '</p>');
            res.write('<p>session ID: ' + req.sessionId + '</p>');
            res.write('<p>user: ' + req.session.user + '</p>');
            res.write('<p>ip: ' + req.session.ip + '</p>');
            res.end();
        }
    } else {
        req.session.views = 1
        req.session.isAuthenticated = false;
        req.session.ip = req.ip;
        res.write('<p> is authenticated?: ' + req.session.isAuthenticated + '</p>');
        res.write('<p>session ID: ' + req.sessionId + '</p>');
        res.end('welcome to the session demo. refresh!')
    }
});

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