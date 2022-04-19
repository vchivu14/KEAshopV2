// THE ACCOUNTS CONTROLLER
//  defines all /accounts routes.
//  The route definitions are grouped together at the top of the file and the implementation functions are below. 
//  The controller is bound to the /accounts path in the main app.js file.
// Routes that require authorization include the middleware function authorize().

const router = require("express").Router();
const authorize = require("../_middleware/authorize");
const accountService = require("./account.service");

// Routes
router.post("/register", register);
router.post("/authenticate", authenticate);
router.post('/refresh-token', refreshToken);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), update);
router.get('/logout', revokeToken);
router.post('/forgot-password', forgotPassword);
router.post('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPassword);

module.exports = router;

function register(req, res, next) {
    accountService.register(req.body, req.get("origin"))
        .then(resp => {
            if (resp) {
                res.json({ message: "Registration successful!"})
            } else {
                res.json({ message: "There is an account registered with this email!"})
            }
        })
        .catch(next);
}

// AUTHENTICATION 
//  is implemented with JWT access tokens and refresh tokens. On a successful authentication
//  the API returns a short lived JWT access token that expires after 15 minutes, and a refresh token that expires
//  after 7 days in a HTTP Only cookie. The JWT will be used for accessing secure routes and the refresh token is used
//  for generating new JWT access tokens when they expire. HTTP Only cookies are used for increased security because they
//  are not accessible to client-side JavaScript which prevents XSS (cross-site-scripting), and the refresh token
//  can only be used to fetch a new JWT access token from the /accounts/refresh-token route which prevents CSRF
//  (cross-site-request-forgery)
//  --> see implementation in account.service 
function authenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    accountService.authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

// helper function
function setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie("refreshToken", token, cookieOptions)
}

// REFRESH TOKEN ROTATION TECHNIQUE
//  is an added security measure.
//  Each time a refresh token is used to generate a new JWT access token, the refresh token is revoked and replaced
//  by a new refresh token. This increases security by reducing the lifetime of refresh tokens, which makes it less likely
//  that a compromised token will be valid (or valid for a long time). 
//  When a refresh token is rotated the new token is saved in the replacedByToken property of the revoked token to create
//  an audit trial in the database.
//  --> see implementation in account.service 
function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    accountService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function getById(req, res, next) {
    if (req.params.id !== req.user.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    accountService.getById(req.params.id)
        .then(account => account ? res.json(account) : res.sendStatus(404))
        .catch(next);
}

function update(req, res, next) {
    if (req.params.id !== req.user.id) {
        return res.status(401).json({ message: "Unauthorized"});
    }

    accountService.update(req.params.id, req.body)
        .then(account => res.json(account))
        .catch(next);
}

function forgotPassword(req, res, next) {
    accountService.forgotPassword(req.body, req.get("origin"))
        .then(() => res.json({ message: "Please check your email for password reset instructions" }))
        .catch(next);
}

function validateResetToken(req, res, next) {
    accountService.validateResetToken(req.body)
        .then(() => res.json({ message: "Token is valid" }))
        .catch(next);
}

function resetPassword(req, res, next) {
    accountService.resetPassword(req.body)
        .then(() => res.json({ message: "Password reset was successful, you can now login" }))
        .catch(next);
}

function revokeToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;

    if(!token) return res.status(400).json({ message: "Token is required" });

    // users can revoke only their own tokens
    if (!req.user.ownsToken(token)) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    accountService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: "Token revoked" }))
        .catch(next);
}