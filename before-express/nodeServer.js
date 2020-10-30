const http = require('http'); // enable yourself to manage http traffic and have access to the request and response objects

const server = http.createServer((req, res) => {
  // Put together HTML message (i.e., the response), where start line is done for us
  res.writeHead(200, { 'content-type': 'text/html' });  // write the header(s) yourself
  res.write('<h1>Hello, World!</h1>');                  // write the body
  res.end();                                          
})

server.listen(3000); // have the server listen for HTTP traffic on port 3000