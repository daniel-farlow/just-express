const path = require('path');
const express = require('express');
const app = express();

app.use(express.static('public')) // serve up static files

app.all('/', (req, res) => {
  // Express handles the basic headers (status-code, mime-type)! Awesome!
  const fileToSend = path.join(__dirname, 'node.html') // absolute path of the running process along with node.html
  res.sendFile(fileToSend); // send node.html file as response (usually we will use a templating language)
  // Express handles the end (as opposed to res.end())! Awesome!
})

app.all('*', (req, res) => {
  res.send(`<h1>Sorry, this page does not exist</h1>`)
})

app.listen(3000);
