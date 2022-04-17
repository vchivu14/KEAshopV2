// MONGOOSE ACCOUT MODEL
//  uses Mongoose to define the schema for the accounts collection in the MongoDB database. 
//  The exported Mongoose model object gives full access to perform CRUD operations in MongoDB.

//  The schema defines the properties in MongoDB for account records. 
//  The virtual properties are convenience properties available on the mongoose model that don't get persisted to MongoDB.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, require: true },
    title: { type:String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    acceptTerms: Boolean,
    resetToken: {
        token: String,
        expires: Date
    },
    passwordReset: Date,
    created: { type: Date, default: Date.now },
    updated: Date
});

// configures which account properties are included when converting MongoDB records to JSON objects.
schema.set("toJSON", {
    // includes the Mongoose virtual id property which is a copy of the MongoDB _id property
    virtuals: true,
    // excludes the Mongoose version key (_v)
    versionKey: false,
    // removes the MongoDB _id and passwordHash properties when converting to JSON
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.password;
    }
});

module.exports = mongoose.model('Account', schema);