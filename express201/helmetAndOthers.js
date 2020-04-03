const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet());

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// The req.body only exists because of express.json() and express.urlencoded() 

// You will generally include the following on every app:
// 1. static
// 2. json
// 3. urlencoded
// It's just good practice and it lets you cover all of your bases (for the most part)

app.post('/ajax', (req, res) => {
    console.log(req.body);
    res.json(["Test",1,2,3,4])
    // res.json() is incredibly important because anytime you need to respond with JSON, and that will be very often depending on what
    // you're building, you're gonna use res.json(), not res.send()
    // Anytime you are going to respond with HTML, you're going to use res.render()
    // res.send() will have the following header: "text/html; charset=utf-8"
    // res.json() will have the following header: "application/json; charset=utf-8"
});

app.listen(3000);