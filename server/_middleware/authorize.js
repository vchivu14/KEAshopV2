// THE AUTHORIZE MIDDLEWARE
//  can be added to any route to restrict access to the route to authenticated users. (optionally roles can be implemented)

require("dotenv").config();
const expressJWT = require('express-jwt');
const db = require("../_db/dbMongoose");

module.exports = authorize;

const secret = process.env.SECRET

// This functions returns an array containing two middleware functions:
//  -1st: expressJWT({ ... }) authenticates the request by validating the JWT access token in the Authorization header
//        of the HTTP request. On successful authentication a user object is attached to the req object that contains
//        the data from the JWT token (in this example includes the user.id)
//  -2nd: authorizes the request by checking that the authenticated account still exists (optionally is authorized).
//        The second middleware function attaches the ownsToken method to the req.user object so they can be accessed
//        by controller functions.
function authorize() {
    return [
        //authenticate JWT token and attach user to request object (req.user)
        expressJWT({ secret, algorithms: ["HS256"] }),

        // authentication based on id
        async (req, res, next) => {
            const account = await db.Account.findById(req.user.id);
            const refreshTokens = await db.RefreshToken.find({ account: account.id });

            if (!account) {
                // the refresh token was revoked or it's
                return res.status(401).json({ message: "Unauthorized"});
            }

            // authentication and authorization successful
            // the double exclamation marks (!!) will cast the result to a boolean value if the result is null
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token); 
            
            next();
        }
    ];
}