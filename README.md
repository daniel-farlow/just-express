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

## Express 101 (plain node vs express: basic server, routing, etc.)

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

## Express 201 (middleware and rendering)

<details><summary> <strong>Middleware in Express</strong></summary>

Express claims itself to really be two things:

1. A router. We saw several of the possibilities previously with stuff like `apt.post`, `apt.get`, etc.
2. A series of middleware that comprises a web framework. 

What does the second point really mean? Middleware is something that happens ... in the middle ... of something. What do we do a lot of in web applications? We get requests and send responses. Middleware is stuff we can do between getting the request and sending back the response: `req ---MIDDLEWARE---> res`. In more "Express-ish" terms, a middleware function is ANY function that has access to the `req`, `res`, and `next` objects. That said, basically Express is just a bunch of middleware! It's a whole bunch of little functions working in unison that have access to `req`, `res`, and `next` that slowly piece together a cool web framework (that and a router).

Maybe think of an illustrative example like this:

1. Request comes in
2. We need to validate the user (sometimes)
3. We need to store some things in the database
4. If there is data from the user, then we need to parse it and store it
5. Respond

Steps 2-4 above are all situations that must be addressed with middleware functions. They are everything that happens between getting the request and firing back a response. 

The response *always* depends on the result. The nature of the dependence (i.e., large or small) could be negligible as we have seen with what we have done so far (i.e., basically sending back some stuff regardless of what kind of request we get). But in some cases it could matter quite a bit (e.g., whether or not a user is validated). The point is that *how* the response is constructed *always* depends on the request in some manner, and Express has a `locals` property on every `response` object intended to effectively capture whatever we want from a specific request--what we capture from the specific incoming `request` can be stored as local variables on the `response` object via `res.locals`. 

As [the docs](https://expressjs.com/en/4x/api.html#res.locals) communicate about `res.locals`: An object that contains response local variables scoped to the request, and therefore available only to the view(s) rendered during that request / response cycle (if any). Otherwise, this property is identical to [app.locals](https://expressjs.com/en/4x/api.html#app.locals). This property is useful for exposing request-level information such as the request path name, authenticated user, user settings, and so on:

```javascript
// Documentation example usage of how you might want to use res.locals
app.use(function (req, res, next) {
  res.locals.user = req.user
  res.locals.authenticated = !req.user.anonymous
  next()
})
```

Basically, the `response` object has a property called `locals` that is pre-built into Express--it is attached to *every* response, and it will live for the life of the response and it's very useful for passing data over to a template. For now, it is simply nice to know that we will be able to pass `res.locals` around from place to place. Every middleware function will have access to `res.locals` for the life of the response. How? Because every middleware function has access to the `response` object. 

We can illustrate all of this by means of a somewhat phony example involving some `validateUser` middleware:

```javascript
const express = require('express');
const app = express();

function validateUser(req, res, next) {
  res.locals.validated = true;
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
})

app.listen(3000);
```

Let's now unpack some of the stuff from above:

<details><summary> <strong>Artificial use of <code>res.locals</code> in <code>validateUser</code></strong></summary>

As can be seen with our definition of `validateUser` and our use of `res.locals`, no reference is even made to the `request` object. Nearly always the local variables you want on the `response` object will depend, in some way, on the `request` object as the example in the docs shows:

```javascript
app.use(function (req, res, next) {
  res.locals.user = req.user
  res.locals.authenticated = !req.user.anonymous
  next()
})
```

We will get to such common use cases very soon.

---

</details>

<details><summary> <strong>Non-anonymous middleware by defining <code>validateUser</code> globally</strong></summary>

The `validateUser` function seen above is an explicit, named function declaration which is different than much of the other middleware we have used to this point. Since `validateUser` is a function whose signature contains `req`, `res`, and `next`, we should note that something like 

```javascript
app.get('/', validateUser); 
```

is basically equivalent to

```javascript
app.get('/', (req, res, next) => {
  res.locals.validated = true;
  next(); 
})
```

The main difference is that declaring the `validateUser` middleware globally will give us access to it globally; that is, we can use `validateUser` wherever we want whereas the callback function/middleware in 

```javascript
app.get('/', (req, res, next) => {
  res.locals.validated = true;
  next(); 
})
```

is only available when a `GET` request is made to the root. 

---

</details>

<details><summary> <strong>Effect of <code>next()</code></strong></summary>

It is hard to overstate how critical `next()` really is. Suppose we omitted it in our definition of `validateUser`:

```javascript
...
function validateUser(req, res, next) {
  res.locals.validated = true;
  // next(); 
}

app.use(validateUser);
...
```

What would happen here? Any route that expected us to *use* (i.e., invoke) the `validateUser` function would not actually get around to sending a response. If we actually ran `app.use(validateUser);`, then `validateUser` would be invoked for whatever path we could try to reach, and doing so would result in `validateUser` running but us never actually sending a response back. The browser would just hang. Not good! Don't forget `next()`: you want to hand control off to the next piece of middleware in the cycle (probably the actually routing you have set up).

---

</details>

<details><summary> <strong><code>app.use(validateUser);</code></strong></summary>

The reason `app.use(validateUser);` is commented out is exactly because of its effect: it results in invoking `validateUser` every time *any* HTTP request is made to *any* path (i.e., `validateUser` is used at the "application level"). Of course, in some cases you may want to do this. But the use cases are likely few.

---

</details>

<details><summary> <strong><code>app.use('/admin', validateUser);</code></strong></summary>

The effect of `app.use('/admin', validateUser);` is that we are telling Express to use `validateUser` for *any* type of HTTP request to *only* the `/admin` path. 

---

</details>

<details><summary> <strong><code>app.get('/', validateUser); </code></strong></summary>

The effect of `app.get('/', validateUser);` is that we are telling Express to use `validateUser` only on `GET` requests for only the path `/`.

---

</details>

---

</details>

<details><summary> <strong>Express <code>helmet</code> and other awesome Express middleware</strong></summary>

In this note we will talk about two important methods that belong to the `express` module that have not been used yet, namely `express.json` and `express.urlencoded`, and then one other piece of middleware (from the `helmet` module) that is not native to Express but that we really should always use for security reasons (always wear your `helmet`!).

Looking at [the docs](https://expressjs.com/en/4x/api.html#express), we see a few Express methods we can use:

- `express.json()`
- `express.raw()`
- `express.Router()`
- `express.static()`
- `express.text()`
- `express.urlencoded()`

We have already touched on `express.static`, but we want to look at `express.json` and `express.urlencoded` now. We'll look at the others later. Let's start with `express.json`. 

As [the docs](https://expressjs.com/en/4x/api.html#express.json) note, `express.json([options])` is a built-in middleware function in Express. It parses incoming requests with JSON payloads and is based on [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html). Returns middleware that only parses JSON and only looks at requests where the `Content-Type` header matches the `type` option (the default `type` option is `application/json`). This parser accepts any Unicode encoding of the body and supports automatic inflation of `gzip` and `deflate` encodings. A new `body` object containing the parsed data is populated on the `request` object after the middleware (i.e., `req.body`), or an empty object (`{}`) if there was no body to parse, the `Content-Type` was not matched, or an error occurred. 

Read the above excerpt from the docs again (and actually visit [the docs](https://expressjs.com/en/4x/api.html#express.json) for all sorts of good and more detailed information). Since `express.json` is based on `body-parser`, just like `express.static` is based on `serve-static`, we can see that by installing the `express` module we also install the `body-parser` module as a dependency (we cannot use `express.json` without the `body-parser` and `express.json` is *built-in* middleware in Express), we can take a look inside the `express` node module and we will find `body-parser` listed as one of the `dependencies` in the `package.json`. So what does this mean? Well, if someone sends you JSON, meaning the `Content-Type` is going to come through as `application/json` or something along those lines, then `express.json` will kick into action and parse the body for us. Note that any data that comes into any server (via form submission or whatever), even if it's an Express server, is still going to be interpreted as a basic string. It doesn't make any difference. That's how servers work. The string needs to be parsed to be of much use and we can do that thanks to `express.json`. Of course, we will want to use this everywhere in our Express application (not just on select paths or routes) and thus we will use it like so:

```javascript
app.use(express.json())
```

Now let's consider `express.urlencoded([options])`. As [the docs](https://expressjs.com/en/4x/api.html#express.urlencoded) note, this is a built-in middleware function in Express. It parses incoming requests with urlencoded payloads and is based on [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html). Returns middleware that only parses urlencoded bodies and only looks at requests where the `Content-Type` header matches the `type` option (the default `type` option is `application/x-www-form-urlencoded`). This parser accepts only UTF-8 encoding of the body and supports automatic inflation of `gzip` and `deflate` encodings. A new `body` object containing the parsed data is populated on the `request` object after the middleware (i.e., `req.body`), or an empty object (`{}`) if there was no body to parse, the `Content-Type` was not matched, or an error occurred. This object will contain key-value pairs, where the value can be a string or array (when `extended` is `false`), or any type (when `extended` is `true`).

We will want to use the `express.urlencoded([options])` middleware at the application level just like `express.json([options])` and it's typically good to set the `extended` property to `false` (the default is `true`) to ensure each value in the key-value pairs that make up the `body` of the `request` (i.e., `req.body`) will be a string or an array: 

```javascript
app.use(express.urlencoded({extended: false}))
```

---

</details>

<details><summary> <strong>Example using <code>express.json</code> and <code>express.urlencoded</code> by making an AJAX post request</strong></summary>

To make much of what appeared in the previous note more concrete, consider the following setup: in the root of the project folder, make a `public` folder and create an `ajax.html` file with the following contents:

``` HTML
<!-- ajax.html -->
<h1>AJAX test page has been loaded!</h1>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

<script>

  function makeOurRequest() {
    return $.ajax({
      method: "POST",
      url: "http://localhost:3000/ajax",
      dataType: "text",
      // dataType: "json",
      data: {
        name: "Daniel"
      }
    });
  }

  const theRequest = makeOurRequest();

  theRequest
    .then(response => console.log(`AJAX request successful! Response: `, JSON.parse(JSON.stringify(response))))
    .catch(err => console.log(`AJAX request failed! Error: `, err))

</script>
```

Then at the root of the project folder create a `server.js` file:

```javascript
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
  res.send('THIS IS A TEST RESPONSE AS PLAIN TEXT') // for dataType: 'text' in ajax request
  // res.send({message: 'this is a test response as JSON'}) // for dataType: 'json' in ajax request
});

app.listen(3000);
```

Let's walk through what happens when you visit `http://localhost:3000/ajax.html`:

- First, we can only access the `ajax.html` file because it is being statically served thanks to `app.use(express.static('public'))`. Once the document is served and loaded, the scripts in the file fire: jQuery is made available to us and then we make an AJAX request with the following properties:
  + `method: 'POST'`: We are making a post request (which will almost always be the case with form submissions and the like).
  + `url: "http://localhost:3000/ajax"`: We are making a POST request to the `/ajax` route--Express will be responsible for accepting the request and putting together a response.
  + `dataType: 'text'` or `dataType:json`: What kind of data are we sending through? 
  + `data: { name: 'Daniel'}`: The actual data we are sending through.
  + Finally, once the request has been made, the return value from the AJAX request is a promise. If that promise is resolved or rejected, then we will respond to indicate so and this can be seen in the browser console. 
- In `server.js`, we have constructed things so that when a `post` request is made to the `ajax` route, we first log the request (and later the request headers specifically) with `console.log(req)` (which will become relevant soon) and then we send our response (which we have set up to be either text or JSON).

| Note about `dataType` and `arg` in `res.send(arg)` |
| :--- |
| The data type of what we send back in our response should match the `dataType` of the AJAX request. If we specify `dataType: 'json'` in the AJAX request but send back text (e.g., `'THIS IS A TEST RESPONSE AS PLAIN TEXT'`) as our response, then the returned promise from the AJAX request will be rejected. On the other hand, if we specify `dataType: 'text'` on the AJAX request but send back JSON (e.g., `{message: 'this is a test response as JSON'}`), then what we actually get back will be the object as text which is not what we want: `{"message":"this is a test response as JSON"}` instead of `{message: "this is a test response as JSON"}`. |

The above note touches on making sure what is being sent and requested are as expected, but what we *really* do not want to happen is to leave off `app.use(express.json());` or `app.use(express.urlencoded({extended: false}));` in our `server.js` file. Why? Run the server and keep an eye on the console (not the browser console but in Node) for what shows up when you visit `http://localhost:3000/ajax.html`. With everything as it is currently, you should see something like the following towards the end of the logged request object:

```javascript
...
body: [Object: null prototype] { name: 'Daniel' },
...
```

What does this mean? It means the `data` sent through (i.e., POSTed) by the AJAX request is coming through as a value (notably as JSON) on the `body` property for the incoming `req`uest object. This is great! What good would form submissions and stuff of that nature be if you could not actually pull the data from the form submissions effectively? That is what `app.use(express.json());` and `app.use(express.urlencoded({extended: false}));` allow us to do. 

Try repeating the above process but this time comment out `app.use(express.urlencoded({extended: false}));`. What do you see logged to the console for the `body` object? You probably see a line like the following:

```javascript
...
  body: {},
...
```

Now repeat the process yet again but this time *also* commenting out `app.use(express.json());`. What do you get for the `body` object? Nothing at all! That's not good. Now, you could probably try to parse things yourself and find the data you want somewhere in the `req` object, but why do this when all of it has been made easier for you? Express middleware to the rescue!

One point of curiosity: Why did we get the data we wanted when we used `app.use(express.urlencoded({extended: false}));` but only got `{}` when it was commented out? This has to do with the headers. Visit the page again *without* commenting out `app.use(express.json());` or `app.use(express.urlencoded({extended: false}));` while also changing `console.log(req)` to just `console.log(req.headers)`. You should then see a line like the following: 

```javascript
'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
```

From above, we can see what the mime-type is: `application/x-www-form-urlencoded`. Now *that* is why we need the `app.use(express.urlencoded({extended: false}));` middleware. When a form comes through, unless specified otherwise, usually the default is going to be `application/x-www-form-urlencoded` for the `content-type`. That's typically how data is passed around by default. Oftentimes it will also be passed around as `application/json` or `text/json`. That's what `app.use(express.json());` is for. But we need `urlencoded` because if someone sends us data with the header shown above, then we need some middleware to parse it and the parsing result is made available to us in the `body` object. The data is stored on the `body` property of the `req` object likely because the middleware is based on `body-parser`.

From everything we have seen so far, it is safe to say good practice is to basically always include the following on any Express application:

- `app.use(express.static('public'));`
- `app.use(express.json());`
- `app.use(express.urlencoded({extended: false}));`

It will cover most of your bases and save you from a bunch of headaches of why something doesn't work, why your data isn't coming through, etc.

One last thing to note concerns the use of `helmet` middleware. It sets HTTP headers right upfront and protects you from a bunch of well-known vulnerabilitie. There's really no reason not to use this middleware. It's very simple: 

```javascript
npm i helment                       // install helmet in your package.json
const helmet = require('helmet');   // import its contents (check npm for more options)
app.use(helmet());                  // use it at the application level 
```

Remember: When using Express, make sure to use your `helmet`.

---

</details>

<details><summary> <strong>Responding with JSON</strong></summary>

In the previous note, in one of the examples, we *manually* tried to respond with JSON by including `res.send({message: 'this is a test response as JSON'})` within Express and having `dataType: 'json'` in our AJAX request. But we can do much better. Looking at [the docs](https://expressjs.com/en/4x/api.html#res.json) in the section about the `response` object, we see `res.json([body])`. This seems to be what we want.

From the docs: `res.json([body])` sends a JSON response. This method sends a response (with the correct `content-type`) that is the parameter converted to a JSON string using [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify). The parameter can be any JSON type, including object, array, string, Boolean, number, or null, and you can also use it to convert other values to JSON.

With this new method, we can drop the `dataType` on the AJAX request completely and just use `res.json`:

```javascript
res.json('Some text');
res.json({message: 'an object without setting dataType on AJAX request'});
res.json(['Some text', {message: 'a message'}, [1,2,3], 4]);
```

As the docs note, any one of the above attempts to respond would result in the parameter (whether it be simple text, an object, an array of a bunch of other things, etc.) being converted to a JSON string using `JSON.stringify` before being sent over the server (remember everything sent over the server is done so as a string ... we simply want the string to be a JSON string which can be effectively parsed). 

To recap: By default, `res.send` is going to set a mime-type of `content-type: text/html`. If, however, we use `res.json`, then the mime-type will be set as `content-type: application/json`. The takeaway is that `res.json` is incredibly important because anytime you need to respond with JSON, which will be very often depending on what you're building, then you're going to use `res.json` and not `res.send`. Any time you are going to respond with HTML, then you will probably use `res.render`, something we will get to shortly.

---

</details>

<details><summary> <strong><code>res.json</code> and <code>res.render</code>: API or server-side rendering</strong></summary>

Something to note which will become more and more evident as you build with Express: `res.render` and `res.json` loosely represent the two main things you would typically do with Express. To make the upcoming need/use of `res.render` evident, let's consider a scenario back in the day where say you wanted to visit MySpace before Facebook killed everything. 

You would get on your computer and go to `www.myspace.com` and you'd connect with their servers. You'd send in a request and the server would need to kick back a response to your browser (which basically only understand HTML, CSS, and JavaScript). So the question becomes: What goes on inside of the server when your request is received? What happens inside? It may be helpful to consider what full stack development is really all about and to look at what makes up a server:

<p align='center'>
  <img width="175px" src='./images-for-notes/server-composition.png'>
</p>

You have a number of different layers in the stack. From bottom to top:

- **OS (operating system):** The server is a computer and you have to have an operating system. You can't do anything without an operating system because you need some means of your software interacting with the hardware. Typically the OS will be [Linux](https://en.wikipedia.org/wiki/Linux), [Windows](https://en.wikipedia.org/wiki/Microsoft_Windows), [UNIX](https://en.wikipedia.org/wiki/Unix), etc.
- **WS (web server):** [Apache](https://en.wikipedia.org/wiki/Apache_HTTP_Server), [Nginx](https://en.wikipedia.org/wiki/Nginx), [IIS](https://en.wikipedia.org/wiki/Internet_Information_Services), etc.
- **DB (database layer):** You'd have a whole host of SQL and NoSQL options: [MySQL](https://en.wikipedia.org/wiki/MySQL), [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL), [Oracle](https://en.wikipedia.org/wiki/Oracle_Database), [MongoDB](https://en.wikipedia.org/wiki/MongoDB), [Apache CouchDB](https://en.wikipedia.org/wiki/Apache_CouchDB), etc.
- **PL (programming layer):** C, C++, Java, Python, Ruby, PHP, R, etc.
- **Front-end UI (bonus):** Not really a part of the server stack but part of full stack development (the front-end layer). You have React, Vue, Angular, etc.

The OS, WS, DB, and PL layers make up the server. When a user sends a request to port 80 (a port created by the transport layer), what happens? How does the server decide how to respond with HTML, CSS, and JavaScript? Since everyone on MySpace has their own page (just like Facebook), the question becomes: Does MySpace have individual HTML pages stored on the hard drive for every single user (millions of HTML pages, all very similar) that they serve up? Of course not. 

What happens is that the user gets to port 80, and then the web server kicks into gear (say it's Apache). Suppose it's running PHP. It starts processing and interpreting PHP. It realizes it needs some stuff from the database (say from MySQL), go back to running some PHP, get some more stuff from the database (hopping back and forth, back and forth, ...). Eventually the back and forth process finishes, and Apache has finished all of its processing. It's read everything, and Apache sends it back out the door. At this point, then, PHP and MySQL have worked together to create HTML, CSS, and JavaScript. What it created was handed off to Apache/Nginx/IIS and *that* was sent back across the wire via HTTP. 

That's how it happens. There's not an individual HTML file that is requested and then sent back. A whole bunch of stuff goes on inside of the server to ensure all of the proper information is being grabbed. A specific HTML file for you does not exist. What likely exists is some sort of template file. Every user page, no matter how complicated, appears basically the same. Maybe colors are different, the song was different, etc. But the structural integrity (think HTML) of each user page was the same. But all of the particulars about different parts of the structure depended on user-supplied information (stored in databases). 

The key here is that the initial request goes out and grabs the HTML, CSS, and JavaScript once it's been made available. But the servers at MySpace are going to have to prepare a new response for every new request. Each new request is like starting over from scratch. So every time we go to our user page, the user page is built up and sent back. Built up and sent back. Every single time. This is called server-side rendering. Because the *server* is in charge of putting together the HTML, CSS, and JavaScript and sending it back to the browser. Wikipedia still does this. Each page you go to you're restarted the whole process from scratch. That is what we will be doing with `res.render`. So within Express, we will be able to create a template, however complicated. And the server is going to process our template into HTML, CSS, and JavaScript. And the template will ultimately be replaced by user-specific information retrieved in a variety of ways. That is server-side rendering. The server is in charge of everything on every page load always. 

The other weapon is `res.json`. And what would happen in a more modern sense is you would go out to a place like Facebook and the first time you go out you have to get everything. You have to get all the necessary HTML, CSS, and JavaScript. Every following request, every time you click on something after that, because it is a single page application in the case of something like React, when you make a new request, instead of making a full-blown request, you are going to use AJAX and, instead of sending back HTML, CSS, and JavaScript, the server is just going to send back JSON. And that original HTML document which was loaded upon the first request, the JSON is going to go there and update the DOM. So it will *look* like a new page, but it's really just the same HTML, CSS, and JavaScript, but it's going to have some new data in it thanks to the JSON. Since we're using AJAX, we will still have a new request. We will still have a `req` and a `res`, it will still be our responsibility to handle that network traffic, but instead of responding with a template (with all the HTML, CSS, and JavaScript), we are *just* going to respond with JSON. 

So the quick review: `res.render` is server-side rendering whereas `res.json` is going to mostly be for API/JSON needs. Server-side rendering is, "I am going to the server and every time the server is going to respond with *new, fresh* HTML, CSS, and JavaScript. Every single time. Always. Think Wikipedia. With `res.json`, or an API type situation, you as the user are going to go out, hit the server, and the server the first time is going to send you a whole bunch of HTML, CSS, and JavaScript. But every time after that, the server is just going to send JSON. And the page or the DOM will update itself accordingly to reflect the incoming data (i.e., JSON) after an AJAX request. Think Facebook or Amazon.

In one case, you always have to come back to the server. The nice thing with `res.render` is you can make use of session variables, cookies, etc. The user always has to come to the server for everything because the server contains everything. The other architecture is very fast, it creates a great UI/UX opportunity, but you have to start storing stuff on the browser you would maybe not normally want to store there.

---

</details>

<details><summary> <strong>Wiring up Express with a view engine</strong></summary>

Let's wire up a basic Express server as we have done previously:

```javascript
const express = require('express');
const app = express();

const helmet = require('helmet');

app.use(helmet());

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res, next) => {
  // res.send('Sanity check')
  // res.json({msg: 'Success!'}) // Send back some legitimate JSON
  res.render('index') // We get an error without a view engine
})

app.listen(3000)
```

Right now, if we visit `http://localhost:3000/`, we'll get an error:

```
Error: No default engine was specified and no extension was provided.
```

The error message you might get sometimes can be rather scary, but often a good strategy is to look for whatever files *you* have created. If we do that, then we will see (in my case)

```
at /Users/danielfarlow/[...]/just-express/express201/rendering.js:14:7
```

This is telling us that there is an issue in the `rendering.js` file (which we have created) on line 14, character 7. In order to use `res.render`, the process goes something like this: 

1. Express as we know it "happens" (i.e., our `rendering.js` file is nothing special except for trying to use `res.render` in one of its route handling response methods; otherwise it's business as usual). All the Node happens. We include express (i.e., `const express = require('express')`), we make our app (i.e., `const app = express()`), we do our middleware, we build our routes, etc. 
2. We define a view engine. There are several options (these are just a few of the most popular ones):
  - [EJS](https://ejs.co/) (Embedded JavaScript): From the home page: What is the "E" for? "Embedded?" Could be. How about "Effective," "Elegant," or just "Easy"? EJS is a simple templating language that lets you generate HTML markup with plain JavaScript. No religiousness about how to organize things. No reinvention of iteration and control-flow. It's just plain JavaScript. Install [via NPM](https://www.npmjs.com/package/ejs) with `npm install ejs`.
  - [Mustache](http://mustache.github.io/): Logic-less templates for a variety of templates. If we were to use this, then we would be interested in [mustache.js](https://github.com/janl/mustache.js), a zero-dependency implementation of the mustache template system in JavaScript. Install [via NPM](https://www.npmjs.com/package/mustache) with `npm install mustache`. 
  - [Jade/Pug](https://pugjs.org/api/getting-started.html): Pug is a high-performance template engine heavily influenced by Haml and implemented with JavaScript for Node.js and browsers. Previously named "Jade," it is now named "Pug" thanks to the fact that "Jade" was a registered trademark. Basically, Pug is a clean, whitespace sensitive syntax for writing HTML (see [the Pug GitHub page](https://github.com/pugjs/pug) or its [API reference](https://pugjs.org/api/reference.html) for more). Install [via NPM](https://www.npmjs.com/package/pug) with `npm install pug`.
3. Inside one of our routes we have a `res.render`. 
4. We pass that `res.render` two things:
  1\. The file we want to use (e.g., an `.ejs` file, a `.mustache` file, a `.handlebars` or `.hbs` file, a `.pug` file, etc.).
  2\. The data we want to send to that file.
5. Express uses the node module for our specified view engine and parses the file accordingly. That means it takes the HTML, CSS, and JavaScript and combines it with whatever "node" there is in the file (i.e., the data available in `res.locals`).
6. The final result of this process is a compiled product of the things the browser can read (i.e., HTML, CSS, and JavaScript).

All the steps above constitute "the round trip" for a `res.render`. The templating engine serves as a bridge between Node and the front-end stuff. We can make a template out of HTML, CSS, and JS, and we can have a bridge that will allow us to access Node.js stuff. The specific bridge is the second argument to `res.render` (i.e., the data we want to send to our template file). That object, the data we want to send to our template file, is made available as `res.locals`. It will give us the ability to pass in a user's name, whether or not the user is validated, and generally any kind of data we might want to send over to the template. And then the template engine can fill out the HTML accodingly with the given data. So Express uses the node module for the view engine and will parse the template file out. It will combine all of the "node stuff" (i.e., the data we make available in `res.locals`) and combine it with HTML, CSS, and JavaScript to return a product of *only* HTML, CSS, and JavaScript that can be sent to the requesting client. 

Before we can effectively use `res.render`, we need to use `app.set` to tell Express what will be used as the templating engine. Note that `app.set` is used for more than just this functionality though.

| [The docs](https://expressjs.com/en/4x/api.html#app.set) on `app.set(name, value)` |
| :--- |
| `app.set(name, value)` assigns setting `name` to `value`. You may store any value that you want, but certain names (like `'view engine'` in our case) can be used to configure the behavior of the server. These special names are listed in the [app settings table](https://expressjs.com/en/4x/api.html#app.settings.table).<br><br> Calling `app.set('foo', true)` for a Boolean property is the same as calling `app.enable('foo')`. Similarly, calling `app.set('foo', false)` for a Boolean property is the same as calling `app.disable('foo')`. <br><br> Retrieve the value of a setting with `app.get()`: `app.set('title', 'My Site')` and then `app.get('title') // "My Site"`|

Underneath the high-level description above in the docs, we see a section about "Application Settings" that provides a table of different properties (where each property corresponds to a `name`, the first argument to `app.set`), the type for that property, a description of the property, and what the default value is. In particular, we `view engine` is one such property, it's a string, a description (the default engine extension, file name extension that is, to use when omitted; note: sub-apps will inherit the value of this setting), and finally a default value of `undefined` (we will need to provide a value that reflects the template or view engine we want to use whether that's `ejs`, `hbs`, `pug`, etc.).

With all of the above said, let's modify our server by running `npm install ejs` and then adding `app.set('view engine', 'ejs')` and see if we encounter any errors:

```javascript
const express = require('express');
const app = express();

const helmet = require('helmet');

app.use(helmet());

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
  res.render('index');
})

app.listen(3000)
```

If we go to `http://localhost:3000/`, then we do get an error, namely the following:

```
Error: Failed to lookup view "index" in views directory "/Users/danielfarlow/[...]/express201/views"
```

So what happened? We failed to lookup view `'index'`. Why `index`? Well, we told Express to go looking for a file `index` by using `res.render('index')`. What should the file extension of `index` be? It should be `.ejs` according to `app.set('view engine', 'ejs')`. Well, we don't have an `index.ejs` file. Furthermore, Express went looking for the `index.ejs` in the `views` folder. But we don't currently have a `views` folder. Why did Express go looking for this file in the `views` folder?

The answer, as usual, is in the documentation. In the "Application Settings" table under [the docs entry](https://expressjs.com/en/4x/api.html#app.set) for `app.set` we see a `name` of `views` that is expected to be a string or array, with a description (a directory or an array of directories for the application's views. If an array, the views are looked up in the order they occur in the array), and finally a default value of `process.cwd() + '/views'` (i.e., the current working directory or `cwd` with `/views` appended to it; basically, it's just looking for the `views` folder in your project director). We're going to be more explicit than `process.cwd() + '/views'` by using the `path` module and using `path.join(__dirname + '/views')`. What's the difference?

| Note: `process.cwd()` vs `__dirname` in Node.js |
| :--- |
| Some helpful comments can be found on [a Stack Overflow post](https://stackoverflow.com/q/9874382/5209533). Basically, the `cwd` in `process.cwd()` is a method of the global object `process` where the return value is a string representing the current working directory of the Node.js process (i.e., where you are currently running Node or simply the directory from which you invoked the `node` command). On the other hand, `__dirname` is the string value of the directory name for the directory containing the current script. The big difference is that `__dirname` is not actually a global but rather local to each module. You can always execute `process.cwd()` to find out where the Node.js `process` originated or is running (you can actually change this with `process.chdir` but we do not need to worry about that right now).<br><br> In a nutshell, knowing the scope of each makes things easier to remember. `process` is `node`'s global object, where `.cwd()` returns where Node is running. `__dirname` is `module`'s property, where the value represents the file path of the module. Similarly, `__filename` is another `module`'s property which holds the file name of the module. |

All that said, `require` the native `path` module at the top of your server like so: `const path = require('path');`. Then, underneath  `app.set('view engine', 'ejs');` we can add `app.set('views', path.join(__dirname + '/views'));`. Then create a `views` folder and place an `index.ejs` file inside of the `views` folder with just an `<h1>Rendered file!</h1>` for right now. So here are the three pieces to `res.render` for a specific file:

1. **The file name:** For example: `index` in `res.render('index');`
2. **The type or extension of the file:** For example: `app.set('view engine', 'ejs');`. This tells us we will be looking for `index.ejs`.
3. **The location of the file:** For example: `app.set('views', path.join(__dirname + '/views'));` tells us the file will be in the `views` directory which should be at the same level at whatever script we are writing our code in (see note above). If we have more than one folder for the views, then the docs note we can include something like `app.set('views', [folder1, folder2, ...]);` where each folder will be searched for the file until the first one is found. It should be noted here that Express will *not* search subdirectories you create within the `views` directory if you plan on creating subdirectories. 

---

</details>

<details><summary> <strong>Using more than one view engine in Express</strong></summary>

In the note above, we learned the basics of wiring up Express with a view engine. It's entirely plausible (albeit somewhat unlikely) that you would want to use *more than one* view engine. Maybe you liks EJS for certain things and Pug more for others. Whatever the case, you can use as many view engines as you like. The only catch is you will have to be explicit for what files you want to render.

Recall from [the docs](https://expressjs.com/en/4x/api.html#app.set) concerning `app.set(name,value)`, the `'view engine'` `name` takes one `value`, the extension to be used for a file name when the file name extension is omitted. Hence, if we declare

```javascript
app.set('view engine', 'ejs');
```

and later invoke `res.render('index');`, then we have basically told Express to assume there's an `.ejs` extension on the end of the `index` file name given to `res.render`. If we did not use `app.set('view engine', 'file-extension')`, then Express would not know what to do with `res.render(index)`. Instead, we would have to *explicitly* (i.e., manually) include the filename extension like so: `res.render(index.ejs)`. The upshot of all this is basically we should use `app.set('view engine', 'file-extension')` to tell Express the *default* template engine we want to use when filenames are provided to `res.render` when the file extension for the file name is omitted. If you want to use a view engine other than the default one set by `app.set('view engine', 'file-extension')`, then you must explicitly provide the file extension for whatever file name you pass into `res.render`. 

Here's the process in more detail with a working server example below it:

1. NPM install the engines you need:

```bash
npm install ejs
npm install pug
npm install hbs
```

2. Set the engine you want to be your default view engine:

```javascript
/* Setting the default view engine
  - Uncomment whichever line you want to set your default view engine
  - Whichever one you uncomment means you do not need to provide 
    the file extension for that file when the file name is passed to
    res.render. For example, if you uncommented the line setting ejs
    to the default view engine, then you could use res.render(index)
    and Express would automatically look for index.ejs
  - If you do not uncomment one of the lines below, then you will always
    have to manually specify the file extension for the file name passed
    to res.render
  - If you set ejs as the default view engine, then whenver you want to
    use hbs, pug, or something else, then you will need to explicitly
    provide the file extension for the file name passed to res.render.
  - In summary, if we set ejs to be the default view engine, then we 
    could use ejs, hbs, and pug in our application like so:
    * res.render(index);        // assumes the file is index.ejs
    * res.render(index.hbs);    // explicitly tell Express to use Handblebars
    * res.render(index.pug);    // explicitly tell Express to use Pug
*/
// app.set('view engine', 'ejs');    // EJS
// app.set('view engine', 'hbs');    // Handlebars
// app.set('view engine', 'pug');    // Pug
```

3. Render your template (be sure to set the file extension when rendering a template without the default extension):

```javascript
res.render(index);        // assumes default use of .ejs extension per above
res.render(index.hbs);    // specify use of handlebars as hbs is not the default
res.render(index.pug);    // specify use of pug as pug is not the default
```

Finally, here's an example tying all of this together (see below the code snippet for directory structure and file contents):

```javascript
// server.js
const path = require('path');

const express = require('express');
const app = express();

const helmet = require('helmet');

app.use(helmet());

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Set the default view engine
app.set('view engine', 'ejs');   // uncomment to make default
// app.set('view engine', 'hbs');   // uncomment to make default
// app.set('view engine', 'pug');   // uncomment to make default

// Specify folders for Express to look in for views files
app.set('views', [
  path.join(__dirname + '/views'), 
  path.join(__dirname + '/views/ejsViews'),
  path.join(__dirname + '/views/handlebarsViews'),
  path.join(__dirname + '/views/pugViews'),
  path.join(__dirname + '/viewsFakeOne'),
]);

// For base visit to the root
app.get('/', (req, res, next) => {
  res.render('index');
})

// For files directly in the views folder (which will be typical)
app.get('/sampleejs', (req, res, next) => {
  res.render('sample', {name: 'EJS'});
})

app.get('/samplehandlebars', (req, res, next) => {
  res.render('sample.hbs', {name: 'HANDLEBARS'});
})

app.get('/samplepug', (req, res, next) => {
  res.render('sample.pug', {name: 'PUG'});
})

// For files in subdirectories of the views folder (somewhat common)
app.get('/subfolderejs', (req, res, next) => {
  res.render('subEjsView', {name: 'EJS in a subfolder'});
})

app.get('/subfolderhandlebars', (req, res, next) => {
  res.render('subHandlebarsView.hbs', {name: 'HANDLEBARS in a subfolder'});
})

app.get('/subfolderpug', (req, res, next) => {
  res.render('subPugView.pug', {name: 'PUG in a subfolder'});
})

// For a file in a viewsFakeOne folder not within views folder
app.get('/fakeview', (req, res, next) => {
  res.render('fakeview', {name: 'EJS in a viewsFakeOne directory'});
})

app.listen(3000)
```

Directory structure needed for this code:

```
express201
 ┣ node_modules
 ┣ views
 ┃ ┣ ejsViews
 ┃ ┃ ┗ subEjsView.ejs
 ┃ ┣ handlebarsViews
 ┃ ┃ ┗ subHandlebarsView.hbs
 ┃ ┣ pugViews
 ┃ ┃ ┗ subPugView.pug
 ┃ ┣ index.ejs
 ┃ ┣ sample.ejs
 ┃ ┣ sample.hbs
 ┃ ┗ sample.pug
 ┣ viewsFakeOne
 ┃ ┗ fakeview.ejs
 ┣ package-lock.json
 ┣ package.json
 ┗ server.js
```

File contents:

```javascript
// subEjsView.ejs
<h1>A template file rendered using <%= name %>!</h1>

// subHandlebarsView.hbs
<h1>A template file rendered using {{name}}!</h1>

// subPugView.pug
h1 A template file rendered using #{name}!

// index.ejs
<h1>Rendered template page!</h1>

// sample.ejs
<h1>A template file rendered using <%= name %>!</h1>

// sample.hbs
<h1>A template file rendered using {{name}}!</h1>

// sample.pug
h1 A template file rendered using #{name}!

// fakeview.ejs
<h1>A template file rendered using <%= name %>!</h1>

// server.js (the code snippet previously)
```

---

</details>

<details><summary> <strong>Example of putting an entire frontend site in Express</strong></summary>

As mentioned previously, we can host entire frontend sites using Express by just dumping everything in a `public` folder and statically serving it. Execute the following commands in the terminal (e.g., bash):

``` BASH
# Navigate to desktop or wherever you want the project to be created
cd ~/Desktop
# Clone the repository at https://github.com/rbunch-dc/jquery-todo
git clone https://github.com/rbunch-dc/jquery-todo.git
cd jquery-todo
# Get rid of the git repository--we don't need it for this example
rm -rf .git
mkdir public
touch server.js
# Initialize a project using npm
npm init -y
npm i express helmet
npm i nodemon -g # if you haven't already
nodemon server.js
```

Now, move all of the files in the directory except `server.js` into the `public` folder (using VSCode or whatever editor you are using) and paste the following code into the empty `server.js` folder and save the file:

```javascript
// server.js
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
```

Now navigate to `http://localhost:3000/` and behold!

---

</details>





## Course Questions to Follow Up On

- TBD

