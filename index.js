const express = require("express");
// Utilized for keeping track of user sessions, these sessions are stored on mongodb
const expressSession = require("express-session");

// Helmet is used for preventing basic attacks, see docs: https://helmetjs.github.io/
//const helmet = require("helmet");
// Rate limit the amount of requests to the server
const rateLimiter = require("express-rate-limit");

const cors = require('cors');

// Creating a cache to improve overall performance and response time for images
const NodeCache = require("node-cache");
const cache = new NodeCache();

// Used for connecting to the MongoDB databse and creating schemas
const mongoose = require("mongoose");
const mongoConnect = require("connect-mongo");

// Authentication uses passport
const passport = require("passport");

// Multer is used for image uploading
const multer = require("multer");
const upload = multer();

/**
 * This section consists of importing all of the functions that are used for the various routes
 * Authentication routes are located in: "routes/api/account"
 * Inventory Management routes (Add and edit products/images) are located in "routes/api/inventory-management"
 * Product fetching routes (Info, Related, and Homepage products) located in "routes/api/products"
 */

// Importing the functions for login, register, and editing profile
const profile = require("./routes/api/account/edit-profile.js");
const login = require("./routes/api/account/login.js");
const register = require("./routes/api/account/register.js");

// Importing function for adding and editing products/images
const addProduct = require("./routes/api/inventory-management/add-product.js");
const addImages = require("./routes/api/inventory-management/add-images.js");
const editProduct = require("./routes/api/inventory-management/edit-product.js");
const editImages = require("./routes/api/inventory-management/edit-images.js");

// Importing functions for fetching products from the DB
const productImages = require("./routes/api/products/product-images.js");
const homepageProducts = require("./routes/api/products/homepage-products.js");
const productInfo = require("./routes/api/products/product-info.js");
const relatedProducts = require("./routes/api/products/related-products.js");
const inventory = require("./routes/api/inventory-management/inventory.js");

// Importing function for making purchases
const checkoutCart = require("./routes/api/purchasing/purchase-items.js");
const pastOrders = require("./routes/api/purchasing/past-orders.js");

const app = express();
const port = 3000;

app.use(cors({
    origin: '*'
}));

// Used for reading from a .env file
require("dotenv").config();

// Initalizing mongoose connection to mongodb database
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Successfully Connected to MongoDB!");
    })
    .catch((error) => {
        console.error(`CONNECTION ERROR: ${error}`);
        process.exit(1);
    });

// Initalizing PassportJS local-strategy for authentication
const initializePassport = require("./routes/auth/initalizePassport");
initializePassport(passport);

// Here we need to use express json and urlencoded for authentication and handling json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Barebones security protections for the server
// Helmet helps to protect express servers, see docs for more: https://helmetjs.github.io/
//app.use(helmet());

// Use rate limit to prevent spamming the server, this will time the user out for env
const limiter = rateLimiter({
    windowMs: process.env.WINDOW_MIN * 60 * 1000, // 10 minute window
    max: process.env.MAX_REQUESTS, //limit each IP to 150 requests
});
if (process.env.NODE_ENV === "production") {
    app.use(limiter);
    console.log("Rate Limiter active!");
}

// Initalize express session
app.use(
    expressSession({
        secret: process.env.SESSION_SK,
        resave: true,
        saveUninitialized: false,
        unset: "destroy",
        cookie: {
            httpOnly: false,
            sameSite: true,
            maxAge: 10 * 4 * 60 * 60 * 1000,
        },
        store: mongoConnect.create({
            mongoUrl: process.env.MONGODB_URI,
            ttl: 10 * 4 * 60 * 60 * 1000,
        }),
    })
);

// Here we initalzie passportJS itself and then start the session
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) =>{
    res.send("Welcome to Sumazon Server!");
})

/** ACCOUNT ROUTES */
// Profile route for editing profile information of the current user
app.post("/api/edit-profile", (req, res) => {
    profile(req, res);
});

// Login route
app.post("/api/login", (req, res, next) => {
    login(req, res, next, passport);
});

// Register route for creating new users
app.post("/api/register", (req, res, next) => {
    register(req, res, next, passport);
});

// Logout route removes the current user from the session
app.post("/api/logout", (req, res) => {
    //Default name for the connection cookie that is stored when a session is created
    res.clearCookie("connect.sid");
    req.logout(() => {
        req.session.destroy(() => {
            res.sendStatus(200);
        });
    });
});

/** INVENTORY MANAGEMENT ROUTES */
// Route used for adding products to the DB
// Receives only the product information like (Price, Description, Category, Item Quantity in Inventory)
app.post("/api/add-product", (req, res) => {
    addProduct(req, res);
});

// Handles image uploading when the admin creates a new product the product info goes to add-product
// and the image goes to add-images route
app.post("/api/add-images", upload.single("image"), (req, res) => {
    addImages(req, res, cache);
});

// Fetches inventory listings for the edit inventory page
// Only returns product information not images
app.get("/api/inventory", (req, res) => {
    inventory(req, res);
});

// Edit product route is used for modifying products
app.post("/api/edit-product", (req, res) => {
    editProduct(req, res, cache);
});

// Edit images route is used for changing the product images
app.post("/api/edit-images", upload.single("image"), (req, res) => {
    editImages(req, res, cache);
});

/** PRODUCT INFORMATION ROUTES */
// Fetches all products listed in the inventory
app.get("/api/homepage-products", (req, res) => {
    homepageProducts(req, res);
});

// Fetch Images from the image schema for all products
// For most of the time this will pull only from the node-cache
// unless the admin has made changes to the product images
app.get("/api/product-images", (req, res) => {
    productImages.fetchImages(req, res, cache);
});

// This is for a singular products information
app.post("/api/product-info", (req, res) => {
    productInfo(req, res);
});

// Fetch products related to the currently viewed product
app.post("/api/related-products", (req, res) => {
    relatedProducts(req, res);
});

/** Checkout Routes for processing and viewing orders */
// Process a customer's order
app.post("/api/checkout", (req, res) => {
    checkoutCart(req, res);
});
// Fetch previous order and orders to be processed
// Returns two different responses depending on the user role
// Admin contains customer info, user only contains items purchased
app.get("/api/orders", (req, res) => {
    pastOrders(req, res);
});

// Listen for requests and print to the terminal to show that its listening and what port
app.listen(port, () => {
    console.log(`Sumazon Server Ready!\nNow listening on port:${port}`);
    // Run initalizeImageCache where we fetch all images from the db and store it to memory
    // this does not return anything
    productImages.initializeImageCache(cache);
});
