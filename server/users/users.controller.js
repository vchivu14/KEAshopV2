// The user controller defines all /users routes for the API. The route definitions are grouped together at the top
//  of the file and the implementation functions are below. The controller is bound to the /users path in the main
//  server.js file.

const router = require("express").Router();
const userService = require("./users.service");

// Routes
router.post("/authenticate", authenticate);
router.get("/", getAll);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
    .then(user => res.json(user))
    .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
    .then(users => res.json(users))
    .catch(next);
}