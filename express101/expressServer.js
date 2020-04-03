// NodeJS is the language
// Express is node, a node module

const path = require('path');

// http is a native module
// const http = require('http');

// express is a 3rd party module
const express = require('express');
// An "app" is the express function (createApplication inside the Express module)
// invoked and is an Express application
const app = express();

// Serve up static files! Only 1 line ... eat it, NodeJS!

app.use(express.static('public'))

// all is a method, and it takes 2 args:
// 1. route 
// 2. callback to run if the route is requested
app.all('/', (req, res) => {        // We'll accept any HTTP request (.all) on any route ('*') or just root route ('/') and run the callback
    // Express handles the basic headers (status-code, mime-type)! Awesome!
    // Instead of res.write(), we will use res.send()
    // read in node.html
    console.log(path.join(__dirname + '/node.html'));
    res.sendFile(path.join(__dirname + '/node.html')) // We won't run into the issues we did with the nodeServer concerning the .png file and .css file not being available since we are statically serving them up
    // res.send(`<h1>This is the home page</h1>`)
    // Express handles the end (as opposed to res.end())! Awesome!
}) 

app.all('*', (req,res) => {
    res.send(`<h1>Sorry, this page does not exist</h1>`)
})

app.listen(3000);
console.log("The server is listening on port 3000...");