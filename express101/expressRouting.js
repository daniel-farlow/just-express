const express = require('express');
const app = express();

// app object has a few methods:
// HTTP verbs! REST verbs! When you make an HTTP request, you're making a specific type of HTTP request 
// CRUD app correspondence 
// 1. get - READ
// - DEFAULT for all browsers is get.
// 2. post - CREATE
// 3. delete - DELETE
// 4. put - UPDATE
// 5. all - I will accept any method or any HTTP verb

// Take 2 args: 
// 1. path
// 2. callback to run if an HTTP request that matches THIS verb is made to the path in #1

// app.all('/', (req,res) => {
//     res.send(`<h1>Welcome to the home ALL page!</h1>`)
// })

app.get('/', (req, res) => {
    res.send(`<h1>Welcome to the home GET page!</h1>`)
})
app.post('/', (req, res) => {
    res.send(`<h1>Welcome to the home POST page!</h1>`)
})
app.delete('/', (req, res) => {
    res.send(`<h1>Welcome to the home DELETE page!</h1>`)
})
app.put('/', (req, res) => {
    res.send(`<h1>Welcome to the home PUT page!</h1>`)
})

// All of the routes above will respond on the home page but only to their given method
// By default, the method for the browser is always a GET method so it may be somewhat difficult to test the other methods above. 
// This is where the Postman app comes in handy, which was specifically made for API development
// The routing system in express is meant to handle two things:
//      1. The TYPE of HTTP request (GET, POST, DELETE, PUT), and 
//      2. The actual path that you want to fetch
// It's worth noting here that Express works from the top down (as opposed to CSS where the last thing dominates)





app.listen(3000);
console.log("The server is listening on port 3000...");