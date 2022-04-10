const { MongoClient } = require("mongodb");
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let dbConnection;

// The main object this module exports out is the _db variable, which holds our database level object.
//  Via this object we will be able to access any collection within that database or change its context to another database.

module.exports = {
    connectToServer: function(callback) {
        client.connect(function (err, db) {
            if(err || !db) {
                return callback(err);
            }

            dbConnection = db.db("KEAshop");
            console.log("Successfully connected to MongoDB!");

            return callback();
        });
    },

    getDB: function () {
        return dbConnection;
    },
};