var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/swag-shop');

var Product = require('./model/product');
var WishList = require('./model/wishlist');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/product', function(request, response) {
    Product.find({},function(err, listAllProducts) {
       if (err) {
           response.status(500).send({error:"Could not fetch products"});
       } else {
           response.send(listAllProducts);
       }
    });
});

app.post('/product', function(request, response) {
    var product = new Product();
    product.title = request.body.title;
    product.price = request.body.price;
    product.save(function(err, savedProduct) {
       if (err) {
           response.status(500).send({error: "Could not save product"});
       } else {
           response.send(savedProduct);
       }
    });
});

app.get('/wishlist', function(request, response) {  //This first finds all wish lists, and then the populate method populates the products in the wishlists so that we dont get only id and get the actual product. Remove populate part and see the difference put err within find then
    WishList.find({}).populate({path: "products", model: "Product"}).exec(function(err, listWishLists) {
       if (err) {
           response.status(500).send({error:"Could not fetch wishlists"});
       } else {
           response.send(listWishLists);
       }
    });
});

app.post('/wishlist', function(request, response) {
    var wishList = new WishList();
    wishList.title = request.body.title;

    wishList.save(function(err, newWishList) {
       if (err) {
           response.status(500).send({error: "Could not create wishlist"});
       } else {
           response.send(newWishList);
       }
    });
});

app.put('/wishlist/product/add', function(request, response) {
    Product.findOne({_id: request.body.productId},function(err, product) { //looks for productId in body (client provides) and uses that to search database.
       if (err) {
           response.status(500).send({error:"Could not add product to wishlist"});
       } else {
           WishList.update({_id:request.body.wishListId}, {$addToSet:{products: product._id}}, function(err, wishList) { //looks for wishListId in body (client provides) and uses that to add the product into that wishlist in the database.
              if (err) {
                  response.status(500).send({error: "Could not add product to wishlist"});
              } else {
                response.send(wishList);
              }
           });
       }
    });
});

app.listen(3000, function() {
    console.log("Swag Shop API is running on port 3000....");
})