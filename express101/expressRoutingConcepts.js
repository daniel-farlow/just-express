const express = require('express');
const app = express();

/* app.all prevents other methods from running after sending our response
  app.all('/', (req,res) => {
      res.send(`<h1>Welcome to the home ALL page!</h1>`)
  })
*/


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

app.listen(3000);
