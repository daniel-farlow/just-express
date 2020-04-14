const express = require('express');
const app = express();

function validateUser(req, res, next) {
  res.locals.validated = true;
  console.log('HARSG')
  next(); 
}

// app.use(validateUser);
app.use('/admin', validateUser);
app.get('/', validateUser); 

app.get('/', (req, res, next) => {
  res.send(`<h1>Main Page</h1>`)
  console.log(`Validated? ${!!res.locals.validated}`);
})

app.get('/admin', (req, res, next) => {
  res.send(`<h1>Admin Page</h1>`)
  console.log(`Validated? ${!!res.locals.validated}`);
})

app.get('/secret', (req, res, next) => {
  res.send(`<h1>This is a secret page. Go away!</h1>`);
  console.log(`Validated? ${!!res.locals.validated}`);
})

app.use('*', (req, res) => {
  res.send(`<h1>Woops! Is no good.</h1>`);
  console.log(`Validated? ${!!res.locals.validated}`);
  console.log(req.params)
})

app.listen(3000);