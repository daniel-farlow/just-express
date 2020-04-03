const express = require('express');
const app = express();

// Express = 2 things
// 1. Router
// 2. Middleware that comprises a web framework
// Middleware is something that happens ... in the middle: req ---MIDDLEWARE---> res
// A middleware function is ANY function that has access to the req, res, next objects.


// req ---MIDDLEWARE---> res
// 1. Request comes in.
// 2. We need to validate the user (sometimes)
// 3. We need to store some things in the database.
// 4. If there is data from the user, then we need to parse it and store it
// 5. Respond
// Steps 2-4 are all situations that need to be addressed with middleware functions 

function validateUser(req, res, next) {
    // get info out of the request object
    // do some stuff with the db (might query the db or add some stuff, whatever)
    res.locals.validated = true;
    console.log("VALIDATED RAN!");
    // if you call next(), then you are telling Express that you want to hand control off to the next piece of middelware in the cycle
    // if you do not call next(), then you have terminated the cycle and the process will end and no more middleware will run
    next(); 
}

app.use(validateUser)   // This means we want to use validateUser at an application level so everybody will use validateUser
                        // the function validateUser will run every time an HTTP request is made. After the function is done executing, 
                        // the next() piece of middleware will run that matches this. app.use(validateUser) will run validateUser on ALL paths, all methods

app.use('/admin', validateUser); // The effect of this would be to use the validateUser function ONLY on /admin, all methods!

app.get('/', validateUser); // This will run validateUser on /, only on get methods! Note what "app.get('/', validateUser);" really looks like:
/*
app.get('/', validateUser);

REALLY LOOKS LIKE

app.get('/', (req, res, next) => {
    res.locals.validated = true;
    console.log("VALIDATED RAN!");
    next(); 
}

WHICH PRETTY MUCH LOOKS LIKE WHAT WE HAVE HAD ALL ALONG
It's just a piece of middleware that's running normally in the app process
*/

app.get('/', (req, res, next) => {
    res.send(`<h1>Main Page</h1>`)
    console.log(res.locals.validated);
})

app.get('/admin', (req, res, next) => {
    res.send(`<h1>Admin Page</h1>`)
    console.log(res.locals.validated);
})

app.listen(3000);