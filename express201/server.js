const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet());

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.post('/ajax', (req, res) => {
  console.log(req)
  // console.log(req.headers)
  // res.send('THIS IS A TEST RESPONSE AS PLAIN TEXT') // for dataType: 'text' in ajax request
  // res.send({message: 'this is a test response as JSON'}) // for dataType: 'json' in ajax request
  res.json('Some text'); // JSONified text
  // res.json({message: 'an object without setting dataType on AJAX request'}); // JSONified text
  // res.json(['Some text', {message: 'a message'}, [1,2,3], 4])
});

app.listen(3000);