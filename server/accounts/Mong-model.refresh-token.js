// MONGOOSE REFRESH TOKEN MODEL
//  is used to define the schema for refreshtokens collection in the MongoDB database.
//  The exported Mongoose model object gives full access to perform CRUD operations in MongoDB.

// The schema defines the properties in MongoDB for refresh token records, and each token references
//  the account that it belongs to via the account ref property.
// The virtual properties are convenience properties available on the mongoose model that don't get persisted to MongoDB.


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    account: { type: Schema.Types.ObjectId, ref: "Account"},
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String
});

schema.virtual("isExpired").get(function () {
    return Date.now() >= this.expires;
});

schema.virtual("isActive").get(function () {
    return !this.revoked && !this.isExpired;
});

module.exports = mongoose.model('RefreshToken', schema);