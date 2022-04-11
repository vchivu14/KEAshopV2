// This middleware checks that the JWT token received in the http request from the client is valid before allowing
//   access to the API. If the token is invalid a 401 Unathorized response is returned.
// The JWT middleware is configured to make all routes secure except for the authenticate route (/users/authenticate)
//   which is publicly accessible.

require("dotenv").config();
const expressJWT = require("express-jwt");

module.exports = jwt;

function jwt() {
    const secret = process.env.SECRET;
    return expressJWT({ secret, algorithms: ["HS256"] }).unless({
        path: [
            //public routes that don't require authentication
            '/users/authenticate'
        ]
    });
}