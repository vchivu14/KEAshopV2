// This is an instance of the express router. We use it to define our routes.
//  The router will be added as a middleware and will take control of requests starting with path /products.
const router = require("express").Router();

// Will help us perform various tasks that our database understands.
let mongo = require("mongodb");

// This will be our connection to the database.
const dbo = require("../_db/connection.js");

// CRUD OPERATIONS

// THE ROUTES + FUNCTIONS
router.get("/products", readProducts);
router.post("/products", createProduct);
router.patch("products/update", updateProduct);
router.get("/products/id", readProduct);
router.delete("/products/id", removeProduct);

//  When it is called it will use a collection.find() operation to query our products collection for the first 50 products.
function readProducts(req, res) {
    const dbConnect = dbo.getDB();
    dbConnect
        .collection("products")
        .find({})
        .limit(50)
        .toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching products.");
            } else {
                res.json(result);
            }
        });
}

function createProduct(req, res) {
    const dbConnect = dbo.getDB();
    const matchDocument = {
        name: req.body.name,
        price: req.body.price,
    }
    dbConnect
        .collection("products")
        .insertOne(matchDocument, function(err, result) {
            if (err) {
                res.status(400).send("Error adding product.");
            } else {
                console.log(`Added a new product with id ${result.insertedId}`);
                res.json(result);
            }
        });
}

function updateProduct(req, res) {
    console.log(req.body.id)
    const dbConnect = dbo.getDB();
    let productId = new mongo.ObjectID(req.body.id);
    const productQuery = { _id: productId };
    const priceIncrease = req.body.price;
    const updates = {
        $inc: {
            price: priceIncrease,
        }
    };
    dbConnect
        .collection("products")
        .findOneAndUpdate(productQuery, updates, {returnOriginal: false}, function(err, document) {
            if (err) {
                res.status(400).send(`Error updating price on product with id ${productQuery._id}!`);
            } else {
                console.log('1 document updated');
                res.json(document.value);
            }
        });
}

function readProduct(req, res) {
    console.log(req.params.id)
    let productId = new mongo.ObjectID(req.params.id);
    const productQuery = { _id: productId }
    dbConnect
        .collection('products')
        .findOne(productQuery, function (err, result) {
            if (err) {
                res.status(400).send(`Error finding product with id ${productQuery._id}!`);
            } else {
                console.log('1 document retrieved');
                res.json(result);
            }
        });
}

function removeProduct(req, res) {
    let productId = new mongo.ObjectID(req.params.id);
    const productQuery = { _id: productId };
    dbConnect
        .collection('products')
        .deleteOne(productQuery, function(err, _result) {
            if (err) {
                res.status(400).send(`Error deleting product with id ${productQuery._id}!`);
            } else {
                console.log('1 document deleted');
                res.status(201).send();
            }
        });
}

module.exports = router;