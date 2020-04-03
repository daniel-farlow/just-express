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

TBD

## Course Questions to Follow Up On

- TBD