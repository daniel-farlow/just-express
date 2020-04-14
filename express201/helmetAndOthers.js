const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet());

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.post('/ajax', (req, res) => {
    console.log(req.headers)
    // res.send('THIS IS A TEST RESPONSE AS PLAIN TEXT') // for dataType: 'text' in ajax request
    res.send({message: 'this is a test response as JSON'}) // for dataType: 'json' in ajax request

    // res.json(["Test",1,2,3,4])
    // res.json() is incredibly important because anytime you need to respond with JSON, and that will be very often depending on what
    // you're building, you're gonna use res.json(), not res.send()
    // Anytime you are going to respond with HTML, you're going to use res.render()
    // res.send() will have the following header: "text/html; charset=utf-8"
    // res.json() will have the following header: "application/json; charset=utf-8"
});

app.put('/thing', (req, res) => {
    console.log(req)
    res.send('Howdy powdy')
})

app.listen(3000);