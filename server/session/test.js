const router = require("express").Router();
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.use("/login", authLimiter);

router.use(helmet());

router.get("", (req, res) => {
    if (!req.session) {
        res.send("No authentication required")
    }  
});

const session_options = {
    secret: process.env.SESSION_SECRET_TEST,
    resave: false,
    saveUninitialized: false,
    cookie: {} 
}
if (router.get('env') === 'production') {
    router.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
router.use(session(session_options));

router.post("/login", async (req, res, next) => {
    console.log("someone hit me")
    res.set('Content-Type', 'application/json');
    if (req.body.email==="foo@foo" && req.body.password==="bar@Bar1") {
        res.locals.email = req.body.email
        next()
    } else res.status(401).send("Unathorized");
},
    (req, res) => {
        req.session.loggedIn = true;
        req.session.email = res.locals.email
        res.send({ Profile: res.locals.email })
    }
);

router.get("/authenticated", (req, res) => {
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

router.get("/home", (req, res) => {
    console.log(req.session.user);
    res.send("You're in " + req.session.user);
});

// On successful authentication the authenticate method generates a JWT using the jsonwebtoken package which generates
//  a token that is digitally signed using a secret key stored as an env variable. 
// The JWT refresh token is returned to the client application which will include it in a secure cookie
//  in every subsequent requests to the server APIs.

// async function authenticate({ email, password }) {
//     const user = users.find(u => u.email === email && u.password === password);
//     if (!user) throw "Username or password is incorrect";
//     //create a JWT token that is valid for 7 days
//     const token = jwt.sign({ sub: user.id }, process.env.SECRET, { expiresIn: '7d' });
//     return {
//         ...omitPassword(user),
//         token
//     };
// }

module.exports = router;