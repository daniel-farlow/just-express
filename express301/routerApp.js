// Third-party modules
const express = require('express');
const app = express();
const helmet = require('helmet');

// Middleware used at the application level
app.use(helmet());
app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

//////////////////////////////////////////////////
// NORMALLY WHERE THE ROUTES WOULD GO
// WE WANT TO MODULARIZE THIS NOW
// THIS LOGIC WILL GO IN theRouter.js
//////////////////////////////////////////////////

// Routes we want to use at different levels of the application
const router = require('./theRouter');

// Enlisting the routes brought in to actually use in the application
app.use('/', router)

app.listen(3000);