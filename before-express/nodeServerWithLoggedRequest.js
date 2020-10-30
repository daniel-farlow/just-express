const http = require('http');
const path = require('path');
const fs = require('fs');
const util = require('util');

const server = http.createServer((req, res) => {
  if (req.url !== '/favicon.ico') {
    fs.writeFile(path.join(__dirname, 'sampleRequest'), util.inspect(req), err => console.log(err));
  }
  res.writeHead(200, { 'content-type': 'text/html' });
  res.write('<h1>Hello, World!</h1>');                
  res.end();                                          
})

server.listen(3000);