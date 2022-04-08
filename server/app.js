require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const session = require("express-session");

const app = express();

app.use(express.static("public"));
app.use(express.json());
const baseLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// app.use(helmet());
app.use(baseLimiter);
app.use("/auth", authLimiter);

app.post("/auth/login", (req, res) => {
    res.send({ message: "You are trying to login" })
});

const session_options = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {} 
}
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(session(session_options));

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

app.listen(PORT, () => {
    console.log("Starting server on port: ", PORT);
});