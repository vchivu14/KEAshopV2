// This middleware contains a method for authenticating user credentials and returning a JWT token, and 
//  a method for getting all users in the application.

require("dotenv").config();
const jwt = require("jsonwebtoken");

// In production we would store the user records in a database with hased passwords.
const users = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' }];

// Bellow we are exporting the service object with just the method names to make it easy to see all the methods
//  at a glance while the rest of the file contains the implementation functions followed by local helper functions.
module.exports = {
    authenticate,
    getAll
};

// On successful authentication the authenticate method generates a JWT using the jsonwebtoken package which generates
//  a token that is digitally signed using a secret key stored as an env variable. 
// The JWT token is returned to the client application which must include it in the HTTP Authorization header of 
//  subsequent requests to secure routes.
async function authenticate({ username, password }) {
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) throw "Username or password is incorrect";

    //create a JWT token that is valid for 7 days
    const token = jwt.sign({ sub: user.id }, process.env.SECRET, { expiresIn: '7d' });

    return {
        ...omitPassword(user),
        token
    };
}

async function getAll() {
    return users.map(u => omitPassword(u));
}

function omitPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}