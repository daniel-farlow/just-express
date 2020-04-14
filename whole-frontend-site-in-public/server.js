const express = require('express');
const app = express();

const helmet = require('helmet');

app.use(helmet());

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res, next) => {
  res.send('index.html')
})

app.listen(3000);
