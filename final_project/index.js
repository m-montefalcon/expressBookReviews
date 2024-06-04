const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const cookieParser = require('cookie-parser');


const app = express();
app.use(cookieParser());
app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Extract the access token from the Cookies
    const token = req.cookies.token; // Assuming the JWT is stored in a cookie named 'token'

    if (!token) return res.sendStatus(401); // No token provided

    jwt.verify(token, 'secret', (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token

        // Attach the user information to the request object
        req.user = user;
        next(); // Proceed to the requested route
    });
});

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
