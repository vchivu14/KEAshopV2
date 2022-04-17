// THE ACCOUNT SERVICE
//  contains the core business logic for account sign up, authentication with JWT & refresh tokens,
//  forgot password & reset password functionality, logout actions, as well as CRUD methods for managing account data.
// The service encapsulates all interaction with the mongooose account models and exposes a simple set of methods
//  which are used by the accounts controller.

require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../_db/dbMongoose");
const crypto = require("crypto");
const sendEmail = require("../_middleware/send-email");

// Bellow we are exporting the service object with just the method names to make it easy to see all the methods
//  at a glance while the rest of the file contains the implementation functions followed by local helper functions.
module.exports = {
    register,
    authenticate,
    refreshToken,
    getById,
    update,
    forgotPassword,
    validateResetToken,
    resetPassword,
    revokeToken
};

const secret = process.env.SECRET;

async function register(params, origin) {
    // we do a lookup in the database using the Mongoose ODM (object-document-model) to make the query
    // based on the values received in the parameters of the function
    if (await db.Account.findOne({ email: params.email })) {
        // send already registered error to the user's email to warn about account duplication
        await sendAlreadyRegisteredEmail(params.email, origin);
        return false;
    }
    // create account object
    // we have defined an account model schema with Mongoose so this functionality is out of the box now
    const account = new db.Account(params);
    // has password
    account.passwordHash = hash(params.password);
    // save account
    // another Mongoose functionality
    await account.save();

    // we return True OR False so that the middleware function who is calling this function
    // knows what answer to send back to the user
    return true;
}

// helper function
async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">
        forgot password</a> page.</p>`
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: "Email already registered",
        html: `<h4>Email Already Registered</h4>
                <p>Your email <strong>${email}</strong> is already registered.</p>
                ${message}`
    });
}

// helper function
function hash(password) {
    return bcrypt.hashSync(password, 10);
}

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.findOne({ email });
    if (!account || !bcrypt.compareSync(password, account.passwordHash)) {
        // by throwing this error here we will send the error back to the calling function
        // which will catch it and forward this message in the response
        throw "Email or password is incorrect";
    }

    // if we get here authentication was successful so we generate JWT and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    // we use the spread operator which aggregates all the objects we have here
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

// helper function
function generateJwtToken(account) {
    return jwt.sign({ sub: account.id, id: account.id }, secret, { expiresIn: "15m" });
}

// helper function
function generateRefreshToken(account, ipAddress) {
    return new db.RefreshToken({
        account: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*50*60*1000),
        createdByIp: ipAddress
    });
}

// helper function
function randomTokenString() {
    return crypto.randomBytes(40).toString("hex");
}

// helper function
function basicDetails(account) {
    const { id, title, firstName, lastName, email, created, updated, isVerified } = account;
    return { id, title, firstName, lastName, email, created, updated, isVerified };
}

async function refreshToken({ token, ipAddress }) {
    // x-tra security if refresh token is used from another IP address than the one was created for
    const rToken = await db.RefreshToken.findOne({ token: token, createdByIp: ipAddress})
    if (rToken === null) {
        revokeToken({ token, ipAddress });
        throw "You logged in from a different computer, please reauthenticate!"
    }
    const refreshToken = await getRefreshToken(token);
    // console.log(refreshToken);
    // if the above expression doesn't end well this is where it stops

    // we extract the account object by destructuring the refresh token
    const { account } = refreshToken;
    // console.log(account);

    // we replace the old refresh token with a new one and save it
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    

    // we make this operation for further analysis
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // if all goes well generatea  new JWT
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    // we use the spread operator which aggregates all the objects we have here
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken
    };
}

// helper function
async function getRefreshToken(token) {
    // Mongoose has the populate() functionality which lets your reference documents in other collections
    // the ref option that we defined in the schema of the RefreshToken is what tells Mongoose which model to use during population
    // This is what we defined in the schema: 
    //  account: { type: Schema.Types.ObjectId, ref: "Account"}
    // So this will find the object we are looking for and populate it with the referenced object
    const refreshToken = await db.RefreshToken.findOne({ token }).populate("account");
    // If the refresh token doesn't exist or it is not active we throw an error
    if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
    return refreshToken;
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

// helper function
async function getAccount(id) {
    if (!db.isValidId(id)) throw "Account not found";
    const account = await db.Account.findById(id);
    if (!account) throw "Account not found";
    return account;
}

async function update(id, params) {
    const account = await getAccount(id);

    // validate (if email was changed)
    if (params.email && account.email !== params.email && await db.Account.findOne({ email: params.email })) {
        throw `Email ${params.email} is already taken`;
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = hash(params.password);
    }

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    return basicDetails(account);
}

async function forgotPassword({ email}, origin) {
    const account = await db.Account.findOne({ email });

    // always return ok response to prevent email duplication
    if (!account) return;

    // create reset token that expires after 15 min
    account.resetToken = {
        token: randomTokenString(),
        expires: new Date(Date.now() + 15 * 60 * 1000)
    };
    await account.save();

    await sendPasswordResetEmail(account, origin);
}

// helper function
async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
        const resetURL = `${origin}/account/reset-password?token=${account.resetToken.token}`;
        message = `<p> Please click the link below to reset your password, the link will be valid for 15 minutes</p>
                    <p><a href="${resetURL}">${resetURL}</a></p>`;
    } else {
        message = `<p> Plsease use the bellow token to reset your password with the <code>/account/reset-password</code> api route:
                    <p><code>${account.resetToken.token}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: "Reset Password",
        html: `<h4>Reset Password Email</h4>
                ${message}`
    });
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        "resetToken.token": token,
        "resetToken.expires": { $gt: Date.now() }
    });

    if (!account) throw "Invalid token";
}

async function resetPassword({ token, password }) {
    const account = await db.Account.findOne({
        "resetToken.token": token,
        "resetToken.expires": { $gt: Date.now() }
    });

    if (!account) throw "Invalid token";

    // update password and remove reset token
    account.passwordHash = hash(password);
    account.passwordReset = Date.now();
    account.resetToken = undefined;
    
    await account.save();
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    // console.log(refreshToken);
    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}