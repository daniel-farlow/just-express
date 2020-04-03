# Course Notes: Just Express

The starter files for the course can be found [on GitHub](https://github.com/robertbunch/justExpress).

## Introduction

The main job for Express is to manage HTTP traffic (i.e., manage how the [request](https://expressjs.com/en/5x/api.html#req) and [response](https://expressjs.com/en/5x/api.html#res) go back and forth). Hence, it makes sense to first talk about what HTTP even is and that relies in part on understanding TCP and UDP.

## Before Express

<details><summary> <strong>Express is just a node module</strong></summary>

Express is "just" a node module. Literally, you can [install Express](https://www.npmjs.com/package/express) via NPM because Express is literally just a node module. The [Express website](https://expressjs.com/) makes clear what Express is:

> Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

It also makes clear how, implicitly or explicitly, the main job for Express is to manage HTTP traffic via methods on the `request` and `response` objects:

> With a myriad of HTTP utility methods and middleware at your disposal, creating a robust API is quick and easy.

---

</details>

<details><summary> <strong>The cloud</strong></summary>

The cloud is not a cloud but just a network of computers (not belonging to you) talking with each other where the language they speak is in "packets," where these packets are little streams of data.

---

</details>

<details><summary> <strong>Data packets</strong></summary>

The data interchange between client and server happens through packets of data. When you deal with Express, you (i.e., the server) are now put in charge of handling what packets of data people (i.e., the client or browser) receive 

<p align='center'>
  <img width="500px" src='./images-for-notes/packet.png'>
</p>

So you are now in charge of effectively serving up that content. Node does most of the heavy lifting via low-level C. As can be seen above in the illustration, a "data packet" consists of 5 parts or layers. From the lowest-level to the highest-level, the following are the layers of each packet:

- **Physical:** Cables. These are the actual physical cables connecting things together. See [the submarine cable map](https://www.submarinecablemap.com/) for more details and the end of this note for two visuals (the map of cables and a randomly chosen specific cable).
- **Link:** Wifi or ethernet connection
- **Network:** IP (Internet Protocol)
- **Transport:** UDP/TCP
- **Application:** HTTP, FTP, SSH, SMTP

The network and transport layers together form the internet protocol suite or TCP/IP. 

Developers generally spend the majority of their time in the application, transport, and network layers, with most time being spent specifically in the application layer. Express only handles HTTP requests, but it's important to note that the HTTP application layer uses the transport layer and specifically TCP instead of UDP.

<details><summary> Submarine cable map</summary>

Here is a picture of the entire cable map as of March 27, 2020:

<p align='center'>
  <img  src='./images-for-notes/submarine-cable-map.png'>
</p>

---

</details>

<details><summary> Particular cable from the submarine cable map</summary>

Here is a specific cable from the submarine cable map (note it is 11,000km in length and where its landing points are):

<p align='center'>
  <img  src='./images-for-notes/specific-cable.png'>
</p>

---

</details>

---

</details>

<details><summary> <strong>TCP and UDP</strong></summary>

You have a computer with an internet connection. The transport layer creates 2^16 = 65,536 ~ 65k ports on your computer. Whenever you start a Node app, say on port 3000, the reason you have that 3000 at all is because you are using one of the 65k ports that the transport layer creates. If you started an app on port 5000 (like a Flask app or Rails app), then again you are using one of those ports. 

Think of your network connection as being a hotel, where the hotel is a single building but with tons of individual rooms that are all numbered. If someone comes to the hotel, then in order to find a guest, they need to know the room number. Armed with the room number, they can actually find who they are looking for. 

Typically what happens is an application of a given machine will issue a network request. Suppose this request is an HTTP request. And suppose the request originates from port 49742 (an arbitrary port of the 65k available). Let's suppose the request wants to talk with port 80 on another computer. That request will get handed off to the transport layer and that will get wrapped up in what's called a segment. Inside of the segment there will be metadata which will have the destination port (i.e., port 80) and the source report (i.e., 49,742). The transport layer will hand that off to the network layer for further processing. When it gets to the receiving machine, it will go through the process in reverse and eventually find the right port. 

There are *two* different kinds of transport layer protocols: UDP and TCP. They can broadly be characterized in the following manner:

### UDP (User Datagram Protocol)

Basically the win is that UDP is crazy fast but the loss is that it is incredibly unreliable. Since Express is based on HTTP and not UDP, Express will not have these faults (but it will also miss out on some of the positives). Here's the high-level view of UDP:

- **Lightweight:** Only 8 bytes for a header. Very little overhead required to work.
- **Connectionless:** If a client wants to talk with a server, then you do not have to create a connection first. You can go ahead and start sending data from the client without a connection to a server being established.
- **Consistency:** UDP is good and bad. 
  * **Bad:** UDP will send data no matter what. This may seem good on the surface but it can also be quite bad. What if there's packet loss? UDP doesn't care. It will keep right on sending packets. It doesn't make any difference. What if the network is very congested? It doesn't care. It will just keep right on sending packets and just making the network more and more congested. What if the packets are out of order? It doesn't care. It's not UDP's problem. They're just going to show up out of order--that will be the other side's problem. 
  * **Good:** Everything mentioned above is bad. So what is good about UDP? What's the win? It's blazing fast. It's very lightweight (the headers are incredibly small). You don't have to bother to set up a connection to start. You can just start sending data. It's consistent in how it sends data. Packets will always show up whether they are ordered properly or not. 
  * **Use cases:** UDP is primarily used for things like video games or real-time communication. If you have ever experienced "lag" in a video game where everything seems to stop or go back in time and then suddenly catch up...that's UDP. That's the client screaming at the server without making a connection. And suddenly the server updates your machine with "Whoops, you're actually way behind. I'm going to start sending some different data." 

### TCP (Transmission Control Protocol)

- **Connection-based:** Unlike UDP, if you are a client and you want to start talking with a computer via TCP (i.e., if you are a browser and want to start communicating with a server), then you don't just start screaming and sending data as in UDP. You have to go through what's called a 3-way handshake. Before you are going to transmit any data, you are going to have to initiate a connection. The 3-way handshake goes like this:
  1. The client says, "Hey, I'd like to talk."
  2. The server responds with yes or no. Hopefully the server responds with yes and that it is happy to set up a connection.
  3. Actual data starts being transmitted.

  These are the 3 steps that will happen before a TCP connection actually goes through.
- **Reliable:** From the above, we can see TCP is reliable because we actually know the connection is going to happen before any data is transmitted. Additionally, for TCP, there are data acknowledgments. What this means is that every time data is transmitted the server will let the client know that it received the client's data and vice-versa. There's also retransmission of data in TCP. If data isn't received, then the server can let the client know (and vice-versa) that some data was not received and the client can send it again.
- **Ordered packets:** With UDP, there may be packet loss or disorganized packets. With TCP, you can guarantee that the packets arrive in the correct order regardless of what happens with the network.
- **Congestion control:** With TCP, if the network is overwhelmed, it may intentionally introduce latency to try and keep packet loss to a minimum to not make the problem worse.

The upshot of all of this is to use TCP when you need reliability and probably UDP when you need something fast and you don't need it to be reliable.

What you need to remember: TCP and IP, together, get two computers ready to talk with each other. They create an environment that will allow two computers to talk with each other. And HTTP uses TCP as the transport layer because it is reliable whereas UDP is not.

---

</details>

<details><summary> <strong>Some notes about HTTP and its requests</strong></summary>

What do HTTP and HTML have in common? The first two letters: **H**yper **T**ext. Something fun to check out: [info.cern.ch](info.cern.ch). This was the very first webpage that was ever made. It's not just HTML. It was the magic that was being able to get all of the networking happening together to be able to *pass* the HTML around. But HTTP doesn't just pass around HTML anymore. HTTP definitely still passes around HTML but it also passes around images, 4k videos, etc. 

Some highlights about HTTP as a protocol:

- **Efficiency:** It is incredibly efficient. TCP remains connected. It connects and then remains connected until all of the data has been sent. HTTP does not have to stay open. HTTP is only connected when absolutely necessary. Once the request arrives, the machines will disconnect entirely from each other. As soon as the responder is ready, the HTTP connection will reestablish across TCP and will send the response.
- **Stateless:** No dialogue. This means the machines only know about each other for as long as the connection is open. As soon as the connection closes, everything is completely forgotten. So if they need to talk again for any reason, they have to start over completely again, which is like to say it's the very first conversation (i.e., the 3-way handshake needs to occur: tell me who you are and what you want). It's not like a phone conversation where the first person says something (request) and listens for a response and there's a running memory throughout of what is being said back and forth (i.e., there's a history and different points that can be looked back to and referenced to inform and continue the dialogue). Stateless means, "I only know about what you just said right now. And I'm going to respond based on that and then completely forget everything." So the requestor gets one thing to say and the responder gets one thing to say and then they are totally done talking.

Illustration of how this process works in practice: Suppose you have a user on a computer who is connected to the internet. Let's say they go to Udemy's website. Here's the process:
  1. The user is going to go through their internet connection (through their ISP) and they'll bounce around however many times before eventually getting to the host machine, Udemy's servers, via TCP and IP. They will go through the process of establishing that 3-way handshake. This is the first step. TCP says the client (i.e., the user's browser) would like to make a connection to the server (i.e., Udemy's servers). 
  2. Via TCP, the server will respond in the affirmative that a connection can be made. 
  3. Then the data will start to come. Part of that data is going to be the HTTP request. So the HTTP request will come into the server and once the request has hit, then that connection is terminated. The TCP connection is still open but the HTTP request has terminated. The client computer is still patiently waiting for some kind of response. It still wants an HTTP response. While the server does its song and dance, it will get an HTTP response together and send back the response. The connection will then be terminated. And then the TCP connection is also terminated and everything goes away.

That's the basic gist of how the networking will interact and how the HTTP messages will go back and forth. What does an HTTP message actually look like though? See the next note.

---

</details>

<details><summary> <strong>HTTP messages (start line, header, body; request/response)</strong></summary>

There are three parts to an HTTP message: 

1. Start line
2. Header
3. Body

HTTP messages are generally all text so you usually can read an HTTP message. Let's unpack each piece of the above. 

### Start Line

The start line is a *single* line, and it describes the type of request on the way there and on the way back in the response it's the status. 

- **Request:** `method path version-of-HTTP`; for example: `get /blog HTTP/1.1`
- **Response:** `version-of-HTTP status-code`; for example: `HTTP/1.1 404`

### Header

The header specifies the request or describes the body. So essentially what it contains is metadata. And it always comes in the form of key-value pairs. So as JS developer, it will look like an object or JSON. There are loads of options in there and the earliest we will use is a mime-type. For example, we might see something like `content-type: text/html`. There will always be a blank line between the header and body. And that is to indicate that all of the header is done and that it's time for the body.

### Body

The "actual stuff" or what you may think of as maybe the content or HTML, the image, etc. 

| Recap and Example |
| :-- |
| All of the above is what makes up HTTP messages. You have to follow that protocol, namely having a start line, header, and body. |

**Example:** We can use something like `curl` to illustrate the above with `curl -v www.google.com` in Bash to get the following:

``` BASH
# Notes that curl gives us are offset by * markers (this isn't part of the HTTP request):
* Rebuilt URL to: www.google.com/
*   Trying 2607:f8b0:4009:80d::2004...
* TCP_NODELAY set
* Connected to www.google.com (2607:f8b0:4009:80d::2004) port 80 (#0)
# Start line
> GET / HTTP/1.1        # GET method; path requested is / (i.e., the root); and protocol is HTTP/1.1
# Header
> Host: www.google.com
> User-Agent: curl/7.54.0
> Accept: */*
# End of header
> 
# In our request, we didn't actually send a body because it's a GET request
# Note the meaning of the left-most arrows: > correspond to request and < to response
# Start line (of response)
< HTTP/1.1 200 OK
< Date: Thu, 02 Apr 2020 05:08:30 GMT
< Expires: -1
< Cache-Control: private, max-age=0
< Content-Type: text/html; charset=ISO-8859-1
...
< Accept-Ranges: none
< Vary: Accept-Encoding
< Transfer-Encoding: chunked
# End of response header
< 
# Response body
<!doctype html>
```

---

</details>

<details><summary> <strong>Node server without Express (the basics/fundamentals)</strong></summary>

<details><summary> TLDR Version</summary>

Here is the TLDR version of possibly the most basic Node server without Express:

```javascript
const http = require('http'); 

const server = http.createServer((req, res) => {
    res.writeHead(200, {'content-type': 'text/html'});
    res.write('<h1>Hello, World!</h1>');
    res.end();
});

server.listen(3000);
```

---

</details>

| Note |
| :--- |
| It is always a good idea to consult [the docs](https://nodejs.org/dist/latest-v12.x/docs/api/) through [the Node website](https://nodejs.org/en/). There you will find documentation about all things Node. For example, [under HTTP](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_http) you will see the following: "To use the HTTP server and client one must `require('http')`. |

In setting up a Node server without Express, we use the following (all of which can be read up on through the links to the docs as noted above): 

| Class | Syntax | Documentation |
| --- | --- | :-: | --- |
| `N/A` | `http.createServer([options][, requestListener])` | [Link](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_http_createserver_options_requestlistener) |
| [`http.ServerResponse`](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_class_http_serverresponse) | `response.writeHead(statusCode[, statusMessage][, headers])` | [Link](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_response_writehead_statuscode_statusmessage_headers) |
| [`http.ServerResponse`](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_class_http_serverresponse) | `response.write(chunk[, encoding][, callback])` | [Link](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_response_write_chunk_encoding_callback) |
| [`http.ServerResponse`](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_class_http_serverresponse) | `response.end([data[, encoding]][, callback])` | [Link](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_response_end_data_encoding_callback) |
| [`http.Server`](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_class_http_server) | `server.listen()` | [Link](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_server_listen) |

The HTTP module is simply part of Node--it is not a third-party module (like Express) that we need to install with NPM or Yarn or something like that. This is the module that will allow us to make HTTP requests and responses (it has those request and response objects for us to interact with). The HTTP module has a `createServer` method that comes with it.

| Note from the docs about `createServer` |
| :--- |
| In [the docs](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_http_createserver_options_requestlistener) we see the syntax `http.createServer([options][, requestListener])` which indicates we are expected to pass `createServer` a `requestListener` function, where the `requestListener` is a function which is automatically added to the `request` event, and `http.createServer` returns a new instance of [`http.Server`](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_class_http_server), which is itself an extension of [`net.Server`](https://nodejs.org/dist/latest-v12.x/docs/api/net.html#net_class_net_server), a class used to create a TCP or IPC server. |

<details><summary> <strong>Additional notes about request/response objects with <code>createServer</code></strong></summary>

As noted above, the `requestListener` function passed to `http.createServer` is automatically added to the `request` event, an event that is emitted each time there is a request to the server (where there may be multiple requests per connection such as in the case of HTTP Keep-Alive connections). The docs entry for `request` begin in the following manner:

- `request` [<http.IncomingMessage>](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_class_http_incomingmessage)
- `response` [<http.ServerResponse>](https://nodejs.org/dist/latest-v12.x/docs/api/http.html#http_class_http_serverresponse)

The docs note that the `http.IncomingMessage` object extends the [`stream.Readable`](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_class_stream_readable) class, is created by `http.Server` or `http.ClientRequest`, and is passed as the first argument to the `request` and `response` event respectively. It may be used to access response status, headers, and data.

The docs note that the `http.ServerResponse` class object extends [Stream](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_stream) and is an object created internally by an HTTP server (not by the user). It is passed as the second parameter to the `request` event. 

---

</details>

In simple terms, the `createServer` method takes one argument, a callback function, where this callback function takes two arguments, the `request` and `response` objects, respectively, which are typically denoted as `req` and `res` to avoid potential naming conflicts while using other node modules.

The `request` and `response` objects, or `req` and `res`, are just that (i.e., what was noted earlier about HTTP traffic and how requests and responses work). The `req` object represents what we know about the requesting machine or the HTTP request that has come in. And we actually know quite a lot about it. Because we need to. We need to be able to get back to them. We need to be able to find them. So their IP address will be in there, we'll know something about their client (i.e., what type of browser it was and stuff like that), what page or route they wanted to find, all the stuff in the headers, whether or not there was any data passed to us, etc. There will be *lots* of stuff inside of the request object. 

The `response` object is what we are going to send back. And, generally speaking, in Express, we are going to get stuff out of the `request` object, and we are going to add stuff to the `response` object. That is somewhat of an oversimplification, but with strict Node we have fairly limited options. Using Express will make our lives so much easier. 

Before we log anything to the console to see anything about a request or possibly putting together a response, we need to be able to *listen* for traffic on the server so we can respond appropriately. Fittingly, `createServer` returns an object with a `listen` method, where `listen` has the following syntax [for TCP servers](https://nodejs.org/dist/latest-v12.x/docs/api/net.html#net_server_listen_port_host_backlog_callback) according to [the docs](https://nodejs.org/dist/latest-v12.x/docs/api/net.html#net_server_listen): 

```javascript
server.listen([port[, host[, backlog]]][, callback])
```

As the docs note, the `listen` function is asynchronous, and when the server starts listening the `listening` event will be emitted. If a `callback` function is passed to `listen`, then the `callback` will be added as a listener for the `listening` event. Hence, it's fairly common to see something like the following:

```javascript
const http = require('http');
const port = 3000;

const server = http.createServer((req, res) => {
  // Stuff
});

server.listen(port, () => console.log(`Server listening on port ${port}!`));
```

The `callback` passed to `listen` in this case is really just a sanity check to make sure the server is listening and that we've started things up effectively. 

| Note about the port number |
| :--- |
| The number `3000` is not special. Neither is `5000` or `8000` or several other arbitrary port numbers (within the 65k possible ports). But there are some exceptions. The port number has to be greater than 1000 because unless your role is `root` then you do not have access to ports 1000 and below unless you change the permissions which is not often advised. |

**Recap:** The HTTP module is native to Node--we do not have to install it. We simply have to ask for it in the form of `const http = require('http');`. We create a `server`. We use the HTTP module to create the server with `http.createServer`, where `createServer` is a function that takes a callback which will run whenever an HTTP request is made to the server. When is an HTTP request made to the server? It is made whenever the `port` on which the server is listening gets an HTTP request. We can try this out with the following simple program:

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  console.log(req);
});

server.listen(3000);
```

Execute this with Node and then open the browser and go to `localhost:3000`. You should see an enormous object logged to the console. 

<details><summary> <strong>Partial <code>req</code> object logged</strong></summary>

You'll see a ton of different things but here's an example of a few of the things:

```javascript
IncomingMessage {
  _readableState: ReadableState {
    objectMode: false,
    highWaterMark: 16384,
    buffer: BufferList { head: null, tail: null, length: 0 },
    length: 0,
    pipes: null,
    pipesCount: 0,
    flowing: null,
    ended: false,

...

  httpVersionMajor: 1,
  httpVersionMinor: 1,
  httpVersion: '1.1',
  complete: false,
  headers: {
    host: 'localhost:3000',
    connection: 'keep-alive',
    'cache-control': 'max-age=0',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    'sec-fetch-dest': 'document',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,la;q=0.8'
  },
  rawHeaders: [
    'Host',
    'localhost:3000',
    'Connection',
    'keep-alive',
    'Cache-Control',
    'max-age=0',
    'Upgrade-Insecure-Requests',
    '1',
    'User-Agent',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    'Sec-Fetch-Dest',
    'document',
    'Accept',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Sec-Fetch-Site',
    'none',
    'Sec-Fetch-Mode',
    'navigate',
    'Sec-Fetch-User',
    '?1',
    'Accept-Encoding',
    'gzip, deflate, br',
    'Accept-Language',
    'en-US,en;q=0.9,la;q=0.8'
  ],
  trailers: {},
  rawTrailers: [],
  aborted: false,
  upgrade: false,
  url: '/',
  method: 'GET',
  statusCode: null,
  statusMessage: null,
  client: Socket {
    connecting: false,
    _hadError: false,

...

```

---

</details>

If you look at the above snippet for the `req` object, then you'll see stuff like the `headers` object which is a bunch of key-value pairs like `host: 'localhost:3000'`, what the `user-agent` is, etc. We are not interested in *all* of this right now. The point is that we get a *ton* of information about the HTTP request that's being made in the form of an `IncomingMessage`. 

With the above code, if you actually made the request, then you may see your browser having a spinning wheel or hanging. What's happening? Basically, the browser is waiting for a response. We fielded the request, but we never sent anything back. And that's a problem for the browser because the browser needs a response to know that we are actually finished. This is where the `response` object, or `res`, comes in. It will be our way of responding to the requestor.

Before putting together the `response` object ourselves, recall the following about what each HTTP message (request or response) is comprised of:

- **start line:** Node will take care of this for us.
- **header:** We need to deal with this in Node even though Express will largely take care of this for us in the future.
- **body:** We are absolutely in charge of this. It's a pain to handle in Node but will be much easier in Express.

Let's put together our response message: 

<details><summary> Start line</summary>

Node takes care of this for us so we do not need to worry about.

---

</details>

<details><summary> Header</summary>

The `response` object has a `writeHead` method we can use which takes two arguments, the first being a status code and the second being an object for the mime-type. We can do something like the following:

```javascript
res.writeHead(200, {'content-type': 'text/html'});
```

This will write out our headers.

---

</details>

<details><summary> Body</summary>

The `response` object has a `write` method we can use and we can pass it some HTML to be used as the body for the response:

```javascript
res.write('<h1>Hello, World!</h1>');
```

---

</details>

We finally need to actually use `res.end()` at the very end because we need to let the browser know to close the connection. So here's the final stripped down Node web server without Express:

```javascript
const http = require('http'); 

const server = http.createServer((req, res) => {
    res.writeHead(200, {'content-type': 'text/html'});
    res.write('<h1>Hello, World!</h1>');
    res.end();
});

server.listen(3000);
```

If we now run `curl -v localhost:3000`, we'll get something like the following:

``` BASH
* Rebuilt URL to: localhost:3000/
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 3000 (#0)
> GET / HTTP/1.1                                # start line (request)
> Host: localhost:3000                          # header 
> User-Agent: curl/7.54.0                       # header
> Accept: */*                                   # header
>                                               # end of start line/headers (and no body)
< HTTP/1.1 200 OK                               # start line (response)
< content-type: text/html                       # header (response)
< Date: Thu, 02 Apr 2020 08:55:29 GMT           # header (inserted by Node)
< Connection: keep-alive                        # header (inserted by Node)
< Transfer-Encoding: chunked                    # header (inserted by Node)
<                                               # end of start line/headers
* Connection #0 to host localhost left intact   # inserted by Node
<h1>Hello, World!</h1>                          # body (response)                       
```

Very cool!

| Note about routing |
| :--- |
| Our little "Hello, World!" message will show up regardless of the path the user tries to visit because we are simply listening on port 3000 for HTTP traffic. Whenever there is traffic, the code above says hey send this response right along. In nodeServerTwo.js, we add a conditional to say what to do based on certain routing (i.e., we will have something specific happen for the home page, etc.) |

---

</details>

<details><summary> <strong>Node server without Express (routing and serving up static files)</strong></summary>

| TLDR |
| :--- |
| The driving point here is that serving up routes and static files in plain Node without Express is **horrible**. It is no fun at all. But as observed at the end of the previous note, we have to have some way of selectively choosing when something renders and when something doesn't. We do not want *everything* to render for a site just when somebody visits the root. Hence, we have to introduce routing of some sort. |

<details><summary> <strong>Basic routing in plain Node without Express</strong></summary>

```javascript
const http = require('http');   // enable ability to manage HTTP traffic
const fs = require('fs');       // access THIS computer's file system (yours, not the requestor's) with Node

const server = http.createServer((req, res) => {
    if (req.url === '/') { // user wants the home page
        res.writeHead(200, { 'content-type': 'text/html' });
        const homePageHTML = fs.readFileSync('node.html');
        res.write(homePageHTML);
        res.end();
    } else if (req.url === "/node.png") {
        res.writeHead(200, { 'content-type': 'image/png' });
        const image = fs.readFileSync('node.png');
        res.write(image);
        res.end();
    } else if (req.url === "/styles.css") {
        res.writeHead(200, { 'content-type': 'text/css' });
        const css = fs.readFileSync('styles.css');
        res.write(css);
        res.end();
    } else {
        res.writeHead(404, { 'content-type': 'text/html' });
        res.write(`<h4>Sorry, this isn't the page you're looking for!</h4>`)
        res.end()
    }
});

server.listen(3000);

```

---

</details>

In the above script, the main "gotcha" is when we try to read in a file that requests *another* file. Hence, for the `node.html` file, which uses the `node.png` file, we have to also make an HTTP request for the `node.png` file which means making another route for `/node.png`. Basically, the whole ordeal becomes quite an enormous mess. Luckily, Express will help us with all of this!

---

</details>

## Express 101

<details><summary> <strong>What is Express and why should we care?</strong></summary>

If we visit [the Express website](https://expressjs.com/), then we are greeted with the following:

> Express: Fast, unopinionated, minimalist web framework for Node.js

What does this mean? Well, let's first make it clear that Express is literally "just" a node module. That is, we cannot have Express without Node even though we can have Node without Express (as painful as that might be).

The "fast" part is debatable because everything is fast until it's not. But Express has put in a lot of work to trim things down and make it as lean and lightweight as possible. The "unopinionated" is a market-friendly word but sometimes it's good and sometimes it's bad. Basically, "unopinionated" means they don't force things on you. Rails is basically the opposite--they make decisions for you like sort of corralling you into using Postgres. The "framework" element is mostly a remark on how the Express architects have tried to make everything that one might commonly use when employing Node in an application. 

There are a lot of reasons to use Express. One of the obvious reasons (or it will be obvious) is all of the utilities Express gives us to avoid a lot of the torment we had to endure previously when trying to serve things up and route stuff in Node. Web applications can be made quickly and easily with Express. There are lots of templating engines for Express like Jade/Pug, EJS, Handlebars, etc. Express truly shines in building APIs. It's almost unfair how quickly and easily you can build one and process JSON and respond with JSON. 

---

</details>

<details><summary> <strong>Basic Express server (reworking the Node server in Express)</strong></summary>

Recall the most basic Node server we set up:

<details><summary> Most basic Node server code for reference</summary>

```javascript
// nodeServer.js
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'content-type': 'text/html'});  
    res.write('<h1>Hello, World!</h1>');                
    res.end();                                          
})

server.listen(3000);
```

---

</details>

We will now recreate the above basic server in Express.

Recall that previously we could just write `const http = require('http');` because the HTTP module is native to Node. Well, the Express module is *not* native to Node. It is a third-party module and thus we need to install it with NPM. So we need to have a `package.json` file in our folder structure. 

| Installing a new node module and where it is saved |
| :--- |
| When you install a new node module, it is going to install itself relative to the first `package.json` it finds. It will put itself in the `node_modules` folder. |

The best way to handle this is to run `npm init` inside of whatever folder your project is in where your node modules should be located (generally at the root-level). 

Since we want to use the Express module, we will execute `npm install express` which then adds a bunch of different dependencies to the `node_modules` folder. Subsequently, we can use the Express module just as we use other modules:

```javascript
const express = require('express');
const app = express();
```

In almost all Express applications, you will include the line `const app = express();` as well. What do these lines do? Well, the `express` variable declared above holds whatever has been exported by the `express` node module. If you look in the `node_modules` folder for `express`, then you can inspect it to see what is being exported (from its `index.js` file). We find the following in `index.js`:

``` JS
module.exports = require('./lib/express');
```

So now we open the `lib` folder inside of the `express` module and look at the `express.js` file. Lots of stuff is being exported but the thing we are interested in is this line which contains what is being exported by default:

```javascript
exports = module.exports = createApplication;;
```

What is `createApplication`? It is a function in that file:

```javascript
function createApplication() {
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  mixin(app, EventEmitter.prototype, false);
  mixin(app, proto, false);

  // expose the prototype that will get set on requests
  app.request = Object.create(req, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })

  // expose the prototype that will get set on responses
  app.response = Object.create(res, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })

  app.init();
  return app;
}
```

So basically write `const express = require('express');` is equivalent to writing `const express = createApplication;`. So when we write `const app = express();` what we are really doing is invoking the `createApplication` function. 

The point of all of this, which may seem like just a bunch of rigmarole, is to train ourselves to think about what is really going on under the hood so we can better inspect problems we may encounter and understand boilerplate syntax.

As noted in [the docs](https://expressjs.com/en/4x/api.html#app.all), the Express `app` comes with a whole bunch of methods, one of which is `all`, which takes two arguments, the first being a route or path and the second being a callback function to invoke if the path specified as the first argument is requested, where the callback accepts three arguments: `req`, `res`, and `next`. The first two we are already acquainted with and the `next` one we will become more acquainted with when we start looking at middleware. 

Let's use `app.all` in a very generic way:

```javascript
app.all('*', (req, res, next) => {
  res.send(`<h1>This is the home page!</h1>`)
})
```

Some things to note here: The `'*'` means we will listen for HTTP traffic for *any* route on the specified port, much as we did previously. The very first win is that Express handles the basic headers (i.e., status code, mime-type; we may have to modify them once we get fancy) which is awesome. Another awesome win is that Express handles closing the connection so we do not manually need to do something like `res.end()`. What we need to deal with is the in-between. We need to come up with the `response` body we want to send back to the requestor. As [the docs](https://expressjs.com/en/4x/api.html#res.send) note, we will not use `res.write` but `res.send`. 

Finally, the last thing we need to do, as noted in [the docs](https://expressjs.com/en/4x/api.html#app.listen), is `app.listen` instead of `server.listen`. 

In sum, we have the following basic servers in Node and Express, respectively:

```javascript
// nodeServer.js
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'content-type': 'text/html'});  
    res.write('<h1>Hello, World!</h1>');                
    res.end();                                          
})

server.listen(3000);

///////////////////////////////////////////////////////

// expressServer.js
const express = require('express');
const app = express();

app.all('*', (req, res, next) => {
  res.send(`<h1>This is the home page!</h1>`)
})

app.listen(3000);
```

---

</details>

<details><summary> <strong>Basic Express routing concepts and implementation</strong></summary>

We will recreate the plain Node server that served static files in a bit but we should get some basic routing concepts down from Express. 

To get started, we can immediately include the `express` module since we are inside the same directory in which `express` was installed before and we can go ahead and plan to listen on port 3000:

```javascript
const express = require('express');
const app = express();

// routing and other stuff

app.listen(3000);
```

As can be seen in [the docs](https://expressjs.com/en/4x/api.html#app.all), `app` has a ton of methods (but we are especially interested right now in the ones in bold):

- **`app.all()`**
- **`app.delete()`**
- `app.disable()`
- `app.disabled()`
- `app.enable()`
- `app.enabled()`
- `app.engine()`
- `app.get()`
- **`app.get()`**
- `app.listen()`
- `app.METHOD()`
- `app.param()`
- `app.path()`
- **`app.post()`**
- **`app.put()`**
- `app.render()`
- `app.route()`
- `app.set()`
- `app.use()`

We are interested in the bolded ones because they correspond to HTTP verbs! REST verbs! Worth noting is that when you make an HTTP request you are making a *specific* type of HTTP request. We can easily see these methods correspond to what many people would think of as a CRUD application where you can create, read, update, and delete, all of which correspond to `app.post`, `app.get`, `app.put`, and `app.delete`, respectively. (The `app.all` method simply accepts any type of request.)

Of course, a `GET` request is the default for all browsers. This is why a tool like [Postman](https://www.postman.com/downloads/) is so useful. You can make all sorts of requests besides a `GET` request (even though you can do that too of course). 

So the application methods we want to focus on right now are the following:

- `app.all()`
- `app.delete()`
- `app.get()`
- `app.post()`
- `app.put()`

Each of these methods takes two arguments, the first being a route or path and the second being a callback function to invoke if an HTTP request is made to the first argument (i.e., the route or path) with a verb that matches the application method name for that route; that is, something like

```javascript
app.post('/post-something', (req, res, next) => {
    res.send(`<h1>I tried to POST something!</h1>`)
})
```

indicates that we are looking out for an HTTP request to the `post-something` route where the HTTP request is specifically a `POST` request. 

The great thing is we can handle all types of requests on the same path/route with very little overhead. The callbacks for the routes will only respond when a request is made to the specified path and the request is of a type equivalent to the application method being used as above with `post`. This is great news!

The point here is that the routing system in Express is meant to handle two things, namely the type of HTTP request and also the path you actually want to fetch. The application methods are named to correspond with the HTTP verbs they are looking out for. 

Express works from the top down. That is, as soon as we have sent a response, subsequent matching routes won't get run (unless we explicitly architect it in a way to do this). 

---

</details>

<details><summary> <strong>Basic Express server with routing (reworking the Node server in Express)</strong></summary>

Recall the basic albeit tedious Node server we set up that handled basic routing:

<details><summary> Basic plain Node server with basic routing</summary>

```javascript
// nodeServerTwo.js
const http = require('http');  
const fs = require('fs');       

const server = http.createServer((req, res) => {
    if (req.url === '/') { 
        res.writeHead(200, { 'content-type': 'text/html' });
        const homePageHTML = fs.readFileSync('node.html');
        res.write(homePageHTML);
        res.end();
    } else if (req.url === "/node.png") {
        res.writeHead(200, { 'content-type': 'image/png' });
        const image = fs.readFileSync('node.png');
        res.write(image);
        res.end();
    } else if (req.url === "/styles.css") {
        res.writeHead(200, { 'content-type': 'text/css' });
        const css = fs.readFileSync('styles.css');
        res.write(css);
        res.end();
    } else {
        res.writeHead(404, { 'content-type': 'text/html' });
        res.write(`<h4>Sorry, this isn't the page you're looking for!</h4>`)
        res.end()
    }
});

server.listen(3000);
```

---

</details>

Using the routing concepts discussed in the previous note, we will now try to recreate the plain Node server above but in Express.

For us to accomplish this, we will start by noting that `app` comes with a `use` method. Per [the docs](https://expressjs.com/en/4x/api.html#app.use), the `app.use([path,] callback [, callback...])` syntax results in mounting the specified middleware function or functions at the specified path: the middleware function is executed when the base of the requested path matches `path`. 

In our specific use case, we will not explicitly provide the path or callback but instead pass something a built-in middleware function in Express, namely `express.static('public')`. As noted in [the docs](https://expressjs.com/en/4x/api.html#express.static) for `express.static(root, [options])`: This is a built-in middleware function in Express. It serves static files and is based on [serve-static](http://expressjs.com/en/resources/middleware/serve-static.html). The `root` argument specifies the root directory from which to serve static assets. The function determines the file to serve by combining `req.url` with the provided root directory. When a file is not found, instead of sending a 404 response, it instead calls `next()` to move on to the next middleware, allowing for stacking and fall-backs. (See the rest of the docs for more details as well as adding options to `express.static`.)

Worth noting is how `express.static` actually works in light of how most Express applications begin:

```javascript
const express = require('express');
const app = express();
```

We noted previously how the `createApplication` function is the default export from `express` module. But there are several other exports, one of which is the `static` method we are now going to use. If we look in the `node_modules` folder as we did before, then we will see the following lines among others:

```javascript
/**
 * Expose middleware
 */

exports.json = bodyParser.json
exports.query = require('./middleware/query');
exports.raw = bodyParser.raw
exports.static = require('serve-static');
exports.text = bodyParser.text
exports.urlencoded = bodyParser.urlencoded
```

Right now, of course, we are interested in the `exports.static = require('serve-static');` line. We can see how `express.static` is based on the `serve-static` module. We could inspect the `serve-static` module and see what the default export is (it's the function `serveStatic`), but we will not go into the details here. The important thing is that we can pass this function a directory name, say `public` as is often the case, and anytime anybody wants to see a resource located in `public`, we do not have to worry about routing or anything like that. 

| Note about how `express.static` works and serving up tons of files |
| :--- |
| Some people actually use `express.static` to serve up entire front-end sites. If using `express.static('public')`, you could drop an entire front-end site into the `public` folder and you're done. You don't have to deal with many headaches you might have to otherwise endure. You *do not* (and *should not*) put `public` in front of the path to the resource you want to access that is being statically served. For example, if `node.png` is in the `public` folder and we are listening on port 3000, then we can access this picture by going to `localhost:3000/node.png` instead of `localhost:3000/public/node.png`.<br><br>For the sake of clarity, although you would never do this in practice, you could also have `app.use(express.static('node_modules'))` and then you'd be statically serving up all the files in the `node_modules` folder. And then we could access whichever one we want, say the `HISTORY.md` one in the `accepts` node module, like so: `localhost:3000/accepts/HISTORY.md`.<br><br>The point is that if we execute `app.use(express.static('folder-name'))` then the server knows that everything in `folder-name` is going to be served up as part of the root domain. It's worth noting too that you can have as many `app.use(express.static('folder-name'))` commands as you want; that is, you can statically serve the contents of as many folders as you want. Do take care, however, that you do not statically serve something that should not be readily accessible. This is why the convention is to name the folder `public` whose contents you want to be made publicly available. Typically, the stuff you would want to be statically served are things like stylesheets, images, etc. |

To fully recreate our Node server, we will not use Node to read in our `node.html` file with the `fs` module but instead use the `sendFile` method on the `response` object to achieve the same thing (courtesy of the native `path` module so we can use an absolute path which is required). That is, instead of having to deal with 

```javascript
if (req.url === '/') { 
  res.writeHead(200, { 'content-type': 'text/html' });
  const homePageHTML = fs.readFileSync('node.html');
  res.write(homePageHTML);
  res.end();
}
```

we will simply have something like the following:

```javascript
app.all('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/node.html'));
}) 
```

It's very uncommon to do something like `res.sendFile`; instead, typically you would do something like `res.render`, but we have not gotten to templates yet which will make that feasible. 

| Note about `__dirname` |
| :--- |
| As noted on [a Stack Overflow thread](https://stackoverflow.com/q/8817423/5209533), `__dirname` is only defined in scripts (i.e., `.js` files). It's not available in the Node REPL. Basically, `__dirname` means "the directory of this script." In REPL, you do not have a script. Hence, `__dirname` would not have any real meaning. It's too bad this is the case because loading a script file while inside the REPL using `.load` will result in an error if you used `__dirname` in your script. One way to get around this is, inside of the REPL, do something like `__dirname = process.cwd()`. In fact, in light of this, instead of using `path.join(__dirname + '/node.html')` as we did above, we could just as well use `process.cwd() + '/node.html'` as the argument to `res.sendFile`. There's a lot more about `process` and its available methods in [the docs](https://nodejs.org/dist/latest-v12.x/docs/api/process.html). Always look at the docs. |

Recapping, we have the following two equivalent ways of handling the basic routes and serving up static files:

Using Express:

```javascript
// expressServerTwo.js
const express = require('express');
const app = express();

app.use(express.static('public'));

app.all('/', (req, res) => {
    res.sendFile(process.cwd() + '/node.html');
}) 

app.all('*', (req,res) => {
    res.send(`<h1>Sorry, this page does not exist</h1>`)
})

app.listen(3000);
```

Using plain Node:

```javascript
// nodeServerTwo.js
const http = require('http');  
const fs = require('fs');       

const server = http.createServer((req, res) => {
    if (req.url === '/') { 
        res.writeHead(200, { 'content-type': 'text/html' });
        const homePageHTML = fs.readFileSync('node.html');
        res.write(homePageHTML);
        res.end();
    } else if (req.url === "/node.png") {
        res.writeHead(200, { 'content-type': 'image/png' });
        const image = fs.readFileSync('node.png');
        res.write(image);
        res.end();
    } else if (req.url === "/styles.css") {
        res.writeHead(200, { 'content-type': 'text/css' });
        const css = fs.readFileSync('styles.css');
        res.write(css);
        res.end();
    } else {
        res.writeHead(404, { 'content-type': 'text/html' });
        res.write(`<h4>Sorry, this isn't the page you're looking for!</h4>`)
        res.end()
    }
});

server.listen(3000);
```

Hopefully it is clear just how much nicer Express is to work with and how much easier we could get things to scale if we wanted or needed to.

---

</details>




## Course Questions to Follow Up On

- TBD