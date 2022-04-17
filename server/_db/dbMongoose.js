// MONGO DATABASE WRAPPER
//  connects to MongoDB using Mongoose and exports an object containing all of the database model object
//  (currently only Account and RefreshToken). It provides an easy way to access any part of the database from a single point.


require("dotenv").config();
const mongoose = require("mongoose");
const connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true};
mongoose.connect(process.env.ATLAS_URI, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    Account: require("../accounts/Mong-model.account"),
    RefreshToken: require("../accounts/Mong-model.refresh-token"),
    isValidId
}

// This is an utility function to enable checking if an id is a valid Mongo ObjectId before attempting to run a query.
function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}