const express = require('express');
const app = express();

// app comes with a use method, and this is how you invoke most middleware in express
// .use() takes 1 arg (right now):
// 1. the middleware you want to run

app.use(express.static('public'))

// The novelty of the line above is that right now if anyone shows up at localhost:3000, then the app will automatically serve up 
// everything in the public directory. We don't actually need to include "public" in the path. It will simply be available.
// We don't even need to have a route because right now the app is listening for traffic on port 3000 so if anybody shows up 
// at localhost:3000, then app.use(express.static('public')) is being added to any HTTP request that comes in 
// we can also use the line app.use(express.static('<directory>')) more than once to statically serve up content that we want to be available








app.listen(3000);
console.log("The server is listening on port 3000...");