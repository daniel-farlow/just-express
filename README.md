# Course Notes: Just Express

The starter files for the course can be found [on GitHub](https://github.com/robertbunch/justExpress).

## Introduction

<details><summary> <strong>Beginning remarks (main job of Express)</strong></summary>

The main job for Express is to manage HTTP traffic (i.e., manage how the [request](https://expressjs.com/en/5x/api.html#req) and [response](https://expressjs.com/en/5x/api.html#res) go back and forth). Hence, it makes sense to first talk about what HTTP even is and that relies in part on understanding TCP and UDP.

---

</details>

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

<details><summary> <strong>Small preface to rendering</strong></summary>

When using `send`, `sendFile`, or `express.static`, we are always sending back HTML, CSS, and JavaScript. Why? Because the browser is on the other end and it is expecting ... HTML, CSS, and JavaScript. The *goal* of Express is to always get to this point *somehow* (i.e., sending back HTML, CSS, and JavaScript). The goal of Express will be either to send back JSON (like in the case of using React or some modern rendering for single page applications) or likely to send back something that is not a *static* product. That is, we do not want to send back static code (as is the case when just dumping a bunch of code in the `public` folder). What if instead of using JavaScript to manipulate the DOM, what if we actually wrote the DOM the way that we wanted it from the beginning. So when the response is initially sent out, instead of having something where blanks are waiting to be filled in with JavaScript, what if instead of that the DOM were written so that when it showed up it showed up front in the correct way? Then we wouldn't need JavaScript to get involved because the DOM would already be correct. We wouldn't need that extra step. But in order to know what would be in the blanks, we need information from Node. In order to pull that off, if we're not going to use JavaScript to manipulate the DOM directly, then we need something in between that can speak both Node and front-end. That thing that speaks both Node and front-end ... that thing is a template engine. 

When a request comes in, Express does its thing internally (our routes and stuff). Before the response goes out, we send a template some Node (i.e., some data from Express) for the template engine to make sense of. Since the template engine speaks both Node and front-end, it will build HTML, CSS, and JavaScript for us, and then it will take that final product and send it back out as the response. So the main job of the template engine is to marry the data from Express to the front-end so that what we get in the end is not a static front-end site but a dynamic front-end site where we can build the DOM based on Node.js. 

In a previous note we talked about a variety of things that went on to use `res.render`. Recall the last 3 parts:

4. We pass `res.render` two things:
  1\. The file we want to use (e.g., an `.ejs` file, a `.mustache` file, a `.handlebars` or `.hbs` file, a `.pug` file, etc.).
  2\. The data we want to send to that file.
5. Express uses the node module for our specified view engine and parses the file accordingly. That means it takes the HTML, CSS, and JavaScript and combines it with whatever "node" there is in the file (i.e., the data available in `res.locals`).
6. The final result of this process is a compiled product of the things the browser can read (i.e., HTML, CSS, and JavaScript).

Note how step 5 is the translation part. It is where Express uses the node module for the specified view engine to parse the template file from a little bit of Node and some HTML, CSS, and JavaScript to *only* HTML, CSS, and JavaScript.

Finally, one very important thing to note concerning something we have

---

</details>

<details><summary> <strong><code>res.locals</code> and passing data in <code>res.render</code></strong></summary>

As noted in [the docs](https://expressjs.com/en/4x/api.html#res.render) for `res.render(view [, locals] [, callback])`: Renders a `view` and sends the rendered HTML string to the client. Optional parameters:

- `locals`, an object whose properties define local variables for the view.
- `callback`, a callback function. If provided, the method returns both the possible error and rendered string, but does not perform an automated response. When an error occurs, the method invokes `next(err)` internally.

There's more from the docs, but what's important to us is the first point about `locals`. Whatever data is passed to `res.render` as the second argument is automatically appended to the `locals` object available in whatever view we are dealing with. Not only that but we can use the data property names directly for their values instead of having to worry about a bunch of destructuring (unless we want to). 

As an example, suppose we have the following in our server file:

```javascript
app.get('/', (req, res) => {
  res.render('index', {
    msg: 'Here is a message.',
    secret: 'This is a secret',
    friends: ['John', 'Jeff', 'Eric']
  });
});
```

And suppose our EJS view is like this:

``` HTML
<h1>Silly example of locals object and its use!</h1>

<h2>The message</h2>
<li><%= msg %></li>

<h2>The secret</h2>
<li><%= secret %></li>

<h2>The friends</h2>
<li>As a basic array: <%= JSON.stringify(friends) %>. But below we list them:</li>
<% for (let i = 0; i < friends.length; i++) { %>
  <li><%= friends[i] %></li>
<% } %>

<h2>The entire locals object</h2>
<pre><%= JSON.stringify(locals, null, 2) %></pre>
```

Then what you will see will be something like the following:

<p align='center'>
  <img width='600px' src='./images-for-notes/the-locals-object.png'>
</p>

Look at all of the properties on the `locals` object! In particular, note how our data was appended to the `locals` object and made available as local variables in the view. We didn't have to use `locals.msg` or anything like that. We also never had to do anything like `res.locals` because it is already a given that we are inside of the `response` object (i.e., `res`) when dealing with our view. This should make sense because we are, after all, inside of `res.render` when specifying what data gets passed to the view template. In fact, trying to access `res.locals` won't even work inside of the template file because that's basically the same as trying to do `res.res.locals` since we are *already* inside of the response object. So when using `locals` just remember you are already inside of the `response` object and that your data is accessible directly using the data property names instead of `locals.<property-name>`.  

*That* is why templating is powerful. We essentially have a bridge between our `.ejs`, `.hbs`, `.pug` or whatever template file/engine you use and the Express server. The `locals` made available in the template comes from the route visited by the user (and whatever middleware is involved in that process). When we're ready to build the DOM, we need something from Express, and we'll write it to our response before it's ever sent out so the browser will never have any idea what's going on behind the scenes. 

It's important to note that `res.locals` lives throughout the lifetime of preparing the `response` (i.e., `res`). When we are actually ready to render and use `res.render`, the second argument passed in to `res.render`, if any, will simply be appended to whatever `res.locals` already is up to that point; that is, we have lots of opportunities between receiving the `request` and calling `res.render` to modify the `res.locals` object using middleware. 

Let's consider a somewhat contrived example to make this more concrete. Suppose we have the following in our `index.ejs` file:

``` HTML
<h2><%= bannerMsg %></h2>
<h2><%= _locals.bannerMsg %></h2>

<p style=<%= userType === 'premium' ? 'color:green;' : 'color:red;' %>> <%= greetingMsg %> </p>

<h2>The entire locals object</h2>
<pre><%= JSON.stringify(locals, null, 2) %></pre>
```

And we have the following in our Express server file:

```javascript
const path = require('path');

const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet());

app.set('views', path.join(__dirname + '/practice-views'));

app.set('view engine', 'ejs'); 

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

function randomNumInclusive(min,max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function validateUser(req, res, next) {
  res.locals.validated = (randomNumInclusive(0,1) === 1 ? true : false);
  next();
}

function userType(req, res, next) {
  let {validated} = res.locals;
  res.locals.userType = (validated ? 'premium' : 'basic');
  next();
}

function greetingMsg(req, res, next) {
  let {userType} = res.locals;
  res.locals.greetingMsg = (userType === 'premium' ? 
    'Thanks for using premium! Drop us a line if you see room for improvement.'
    : 'Enjoying your basic plan? Consider upgrading to premium!')
  res.locals.bannerMsg = 'bannerMsg set on res.locals during middleware sequence'
  next();
}

app.get('/', validateUser);
app.get('/', userType);
app.get('/', greetingMsg);

app.get('/', (req, res, next) => {
  res.render('index', {
    bannerMsg: 'bannerMsg passed manually in second argument in res.render'
  });
});

app.listen(3000);
```

First let's take a look at the two possible outcomes and then tease apart what all is happening/happened:

<p align='center'>
  <img width='400px' src='./images-for-notes/res-locals-use1.png'>&nbsp;&nbsp;&nbsp;&nbsp;
  <img width='400px' src='./images-for-notes/res-locals-use2.png'>
</p>


The `randomNumInclusive` function is only meant to ensure we get a random number between 0 and 1, inclusive, to simulate randomly determining whether or not a user is validated so as to start the cascading effect that will become apparent:

- `app.get('/', validateUser);`: Express knows to run the `validateUser` middleware as soon as a GET request is made to the root. We randomly determine whether or not the user is validated and store the result on the `res.locals` object as `validate: true/false`. Since `next()` is in this middleware, control gets handed off to the next piece of middleware.
- `app.get('/', userType);`: This is the `next` piece of middleware referred to above. The `userType`, `premium` or `basic`, is determined at this step based on whether or not the user was (randomly) validated from the previous piece of middleware. Note how we actively use `res.locals` in this piece of middleware to *further* add data to `res.locals` in the form of what `userType` we have. If the user is validated, then the `userType` is set to `premium`. If not, then `userType` is set to `basic`. Control is now passed to the `next` piece of middleware.
- `app.get('/', greetingMsg);`: A greeting message is formed based on what `userType` we have. Control is now passed to the `next` and final piece of middleware where `res.render` is called.
- We use `res.render`: At this point, `res.locals` has a number of different properties and corresponding values on it. Note that *we do not have to pass `res.render` a second argument in order to have access to `locals` as local variables in the template file*. That is, when we call `res.render`, it is up to us if we want to pass *additional* data to be appended to `res.locals`. At this point, we can use anything/everything on the `locals` object in the template file. 

**Note:** Properties and values manually set on `res.locals` throughout the middleware process before calling `res.render` are available as local variables in a template file, but what if one of the property names manually set on `res.locals` conflicts with a property of the same name given as part of the second argument to `res.render`? If we use the variable name just on its own, the last one assigned "wins" or takes precedence. But note that we can still access the one we set manually by accessing it through the `_locals` object on `res.locals`. Properties and values manually set on `res.locals` are appended to the `_locals` object on `res.locals`. Hence, if we still want to access the property value we manually set, then we will need to use `_locals.<property-name>`. For example, suppose we set 

```javascript
res.locals.bannerMsg = 'bannerMsg set on res.locals during middleware sequence';
``` 

somewhere in the middleware process and later invoked the `res.render` method like so:

```javascript
res.render('index', {bannerMsg: 'bannerMsg passed manually in second argument in res.render'});
``` 

If we just try to access `bannerMsg` in our template file, then we will get `'bannerMsg passed manually in second argument in res.render'`. However, we can access `_locals.bannerMsg` and that will give us `'bannerMsg set on res.locals during middleware sequence'`. 

Nifty!

---

</details>

<details><summary> <strong>Passing data that we trust (in EJS)</strong></summary>

As [the docs](https://ejs.co/) note: 

- `<%= val %>`: Outputs the unescaped value of `val` into the template (HTML escaped)
- `<%- val %>`: Outputs the unescaped value of `val` into the template

How could this be useful? Well, suppose we have some HTML in our database that we want to retrieve and drop into our template. The default way of dropping stuff into the DOM `<%= val %>` will result in literally *printing* the HTML string in the DOM (since the HTML is escaped for `<%= val %>`) which is obviously not what we want. We don't want to escape the HTML in this case. We want the browser to interpret it. Hence, in such cases, we use `<%- val %>`. 

Why would we *normally* not want to use `<%- val %>`? Well, HTML is generally considered unsafe because if Express or the templating engine doesn't know where the HTML came from, then it could be that someone sneaked a `script` tag in there and is trying to do some kind of cross-origin attack or something of that nature. So by default HTML is escaped. But if you want the HTML to be evaluated and you trust the source of the HTML, like if you yourself are pulling it from your own database, then instead of using `<%= val %>` you will use `<%- val %>`. This will print off the HTML and tell the browser to interpret it rather than to just print the string off as text. Basically, using `<%- val %>` indicates that you *trust* the data. You know that it's safe because it's coming from us somehow or we just trust it for whatever reason. It is the only way to get escaped data out and to have it print as desired. 

Rob gives an example of having a company directory where all the pictures were stored in base64-encoded format. So in the database you'd have a large string representing a picture and anytime you'd want to drop the picture in the DOM, well you would want to use `<%- val %>` very likely.

<details><summary> <strong>Example from Rob with base64-encoded picture</strong></summary>

The `.ejs` file:

``` HTML
<h1><%= msg %></h1>
<h2><%= msg2 %></h2>
<h3><%= validated %></h3>

<%- html %>
```

The Express/server file:

```javascript
const path = require('path')

const express = require('express');
const app = express();

const helmet = require('helmet');
app.use(helmet());

app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs')
app.set('views',path.join(__dirname, '/practice-views'))

app.get('/about',(req, res, next)=>{
    res.render('about',{})
})

function validateUser(req, res, next) {
  res.locals.validated = true;
  next();
}

app.get('/', validateUser);

app.get('/',(req, res, next)=>{
    // the data, in the 2nd arg, is going to be appened to res.locals
    res.render("indexWithUnescapedHTML", {
        msg: "Failure!",
        msg2: "Success!",
        // HTML came from the DB and we want to drop it in the template
        html: `<p><img src="data:image/jpeg;base64,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" /></p>`
    })
})

app.listen(3000)
```

---

</details>

---

</details>

<details><summary> <strong>Including other files for robust templating in EJS</strong></summary>

One other thing that's awesome about template files is the ability to pass around code amongst the templating files themselves. That is, basically you can make template files to make your code more modular. Maybe you always want the head for your HTML files to be the same, the navbar the same, etc. 

For example, suppose we make a `head.ejs` file where we will put regular HTML header stuff (the idea is that we want this to appear on *every* page, hence the template):

``` HTML
<!-- head.ejs -->
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link rel="stylesheet" href="/css/styles.css">
</head>
```

We can now create another template for the navbar:

``` HTML
<!-- navbar.ejs -->
<nav class="navbar navbar-default">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="#">WebSiteName</a>
    </div>
    <ul class="nav navbar-nav">
      <li class="active"><a href="#">Home</a></li>
      <li><a href="#">Page 1</a></li>
      <li><a href="#">Page 2</a></li>
      <li><a href="#">Page 3</a></li>
    </ul>
  </div>
</nav>
```

Finally, our `index.ejs` would look something like the following (make sure to unescape the HTML you are including):

``` HTML
<!-- index.ejs -->
<%- include('./head') %>
<%- include('./navbar') %>

<h1>Home page!</h1>
<%= msg %>
```

As the last step we have our Express/server file we have been making every step of the way:

```javascript
const path = require('path');

const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet());

app.set('views', path.join(__dirname + '/practice-views'));

app.set('view engine', 'ejs'); 

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res, next) => {
  res.render('index', {
    msg: 'a message'
  });
});

app.listen(3000);
```

Using `<% include('head') %>` is the equivalent of basically copying and pasting all of the code in the `head.ejs` file and dumping it at the top of the `index.ejs` file. The idea is that if you have multiple pages then you can just `include` whatever you want on whatever page and keep things nice and tidy. Assuming we have `app.set('view engine', 'ejs'); ` in our Express server, which we do, then we can omit the file extension when we use `include` with EJS. If, however, EJS is not the default engine, then you will need to include the file extension.

Finally, we could easily make an about page by including the head and navbar and then something else by making an `about.ejs` file like so: 

``` HTML
<%- include('./head.ejs') %>
<%- include('./navbar.ejs') %>

<h1>About page!</h1>
<%= msg %>
```

Then we can add the following to our Express server:

```javascript
app.get('/about', (req, res, next) => {
  res.render('about', {
    msg: 'an about message'
  })
})
```

The effect is that our about and home pages look the same in the way that we want them to look the same.Nifty!

---

</details>

<details><summary> <strong>Rendering in Express with EJS, Handlebars, and Pug</strong></summary>

Probably the best way to learn is to consult the docs for each view engine:

- [EJS](https://ejs.co/)
- [HBS (handlebars)](https://handlebarsjs.com/)
- [Pug (previously Jade)](https://pugjs.org/api/getting-started.html)

Since most of the previous notes relate to using EJS, the examples with Handlebars and Pug are more sparse. Nonetheless, `hbsPractice.js` and `pugPractice.js` files have been provided as the Express server, where they are intended to serve up the `index` file in the `practice-views` folder accordingly (i.e., `index.hbs` for handlebars and `index.pug` for pug).

---

</details>

## Express 301 (req and res revisited, the router, and the express generator)

<details><summary> <strong>Adding styles to template files (properly setting<code>href</code>)</strong></summary>

Suppose your directory structure looks something like the following:

```
project
 ┣ node_modules
 ┣ public
 ┃ ┗ stylesheets
 ┃ ┃ ┗ styles.css
 ┣ views
 ┃ ┣ login.ejs
 ┃ ┗ welcome.ejs
 ┣ package-lock.json
 ┗ package.json
```

Within `login.ejs` we want to use some styles from our `stylesheets` directory. Why might it make sense to have `link` tag as such:

``` HTML
<link rel="stylesheet" type="text/css" href="/stylesheets/styles.css">
```

The answer is that since the styles are statically being served from the `public` directory and we have used `app.use(express.static('public'))`, Express will look through the `public` directory for a folder `stylesheets` and a file `styles.css` within that folder. Express knows to do this because when it looks through the `public` folder the path is simply

```
/Users/danielfarlow/Desktop/[...]/project/public
```

Hence, if we set the `href` to `href="/stylesheets/styles.css"`, this is equivalent to

```
/Users/danielfarlow/Desktop/[...]/project/public/stylesheets/styles.css
```

The same principle can be applied to scripts or whatever else you may have in your `public` folder or wherever it is you are statically serving files from.

---

</details>

<details><summary> <strong>Forms: getting data from the <code>request</code> object</strong></summary>

Consider the following basic `login.ejs` file with a basic form:

```javascript
<link rel="stylesheet" type="text/css" href="/stylesheets/styles.css">
<div class="login-page">
  <div class="form">
    <form action="/process_login" method="post" class="login-form">
      <input type="text" placeholder="username" name="username" />
      <input type="password" placeholder="password" name="password"/>
      <button>login</button>
      <p class="message">Not registered? <a href="#">Create an account</a></p>
    </form>
  </div>
</div>
```

The `action` attribute on a `form` tag determines where the form is going to be submitted when it is submitted. On a front-end framework, you would never submit the form because you don't want to leave the HTML page. But in our case, because we're using `res.render`, Express is in charge of rendering every single page. So we are going to have Express move the form once it is submitted to on to the `/process_login` route, and it will be a `post` request (the `method` attribute on the form indicates what kind of request is going to be fired off once the form is submitted). This should immediately remind us that we need some middleware in Express to handle what happens when we get a request, specifically a `post` request, to the `/process_login` route. For right now let's just do a simple test:

```javascript
app.post('/process_login', (req, res, next) => {
  console.log(req.body); // see what data is coming across the wire from the form
  res.json({
    message: 'You tried to login!'
  })
})
```

The data, as it is being passed from the `form`, is coming from two `input` boxes. We have `text` and `password` being submitted by the user. In HTML, whatever the `name` attribute is set as is what is going to be passed as to whomever comes next. In our case, our `/process_login` route is going to get the submitted data through `body` on the `request` object (thanks to `app.use(urlencoded{extended: false})`) and the property names will correspond to whatever `name`s were set on the `input` tags with the property values being whatever the user entered. 

For example, suppose our `form` had the following `input` tags:

``` HTML
<input type="text" placeholder="username" name="some" />
<input type="text" placeholder="user" name="thing" />
<input type="password" placeholder="password" name="else"/>
```

And suppose the user typed in values of `An`, `illustrative`, `example` into the different `input` fields, respectively. Once the `form` was submitted, we we would see something like the following come across the wire:

```
[Object: null prototype] {
  some: 'An',
  thing: 'illustrative ',
  else: 'example'
}
```

Whatever the user submitted will come through the HTTP message and the form will come through as `urlencoded` (hence the need of the Express middleware to parse the HTTP message corresponding to the user-submitted request and to tack on the data to the `req.body` object). Note that before the `urlencoded` request gets to `app.post('/process_login', ...)` it is subjected to all of the middleware used at the application level, namely `app.use(express.urlencode{extended: false})`. This middleware parses the `request` object coming from the user and will add to the `request` object a `body` property which will have the user-submitted data from the form on it.

What we actually want to accomplish here is we want to decide what to do with the user. Think about what happens when you log in to a site. Are you redirected to a certain page only for logged in users? Are you redirected to your dashboard? Somewhere else? The point is we can have a bunch of logic in our routes to handle the user effectively. And almost always your logic will *depend* on properties on the `request` object. In the case of form-submitted data, we have access to information on the `body` of the `request` which should further inform what we want to do with the user. It's fairly common to destructure information off the `body` of the `request` like so (as an example of our login form):

```javascript
const { username, password } = req.body;
```

Then you can do stuff like check the database to see if a user's credentials are valid (maybe you're using `bcrypt` or some version of `blowfish` or some sort of algorith or OAuth). As an example, suppose we want to direct the user to the welcome page if they are valid. And we might want to save their username in a cookie--or you could use sessions (we want to do this to make it readily available). Sessions and cookies are very similar. The difference is that cookie data is stored entirely on the browser and the browser will send it up to the server every time a request is made. Session data, on the other hand, is stored on the server and the browser is essentially given a key for that data. But sessions are not included with Express (you can fetch [express-session](https://www.npmjs.com/package/express-session) if you want to use that instead of cookies). But the ability to do things with cookies is built-in with Express so we'll just use that instead in this case. You could use local data too, but we're just going to stick with cookies for this. 

---

</details>

<details><summary> <strong>Cookies: using <code>res.cookie</code>, <code>res.clearCookie</code>, and other cookie-related information</strong></summary>

As always, it is best to look at [the docs](https://expressjs.com/en/4x/api.html#res.cookie). We see the following for `res.cookie(name, value [, options])`: Sets cookie `name` to `value`. The `value` parameter may be a string or object converted to JSON. The `options` parameter is an object that can have the following properties.

| Property | Type | Description |
| :-- | :-: | :--| 
| `domain` | String | Domain name for the cookie. Defaults to the domain name of the app. |
| `encode` | Function | 	A synchronous function used for cookie value encoding. Defaults to `encodeURIComponent`. |
| `expires` | Date | Expiry date of the cookie in GMT. If not specified or set to 0, creates a session cookie. |
| `httpOnly` | Boolean | Flags the cookie to be accessible only by the web server. |
| `maxAge` | Number | Convenient option for setting the expiry time relative to the current time in milliseconds. |
| `path` | String | Path for the cookie. Defaults to `"/"`. |
| `secure` | Boolean | Marks the cookie to be used with HTTPS only. |
| `signed` | Boolean | Indicates if the cookie should be signed. |
| `sameSite` | Boolean or String | Value of the "SameSite" `Set-Cookie` attribute. More information [here](https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00#section-4.1.1) |

**Note:** All `res.cookie()` does is set the HTTP `Set-Cookie` header with the options provided. Any option not specified defaults to the value stated in [RFC 6265](https://tools.ietf.org/html/rfc6265).

See [the docs](https://expressjs.com/en/4x/api.html#res.cookie) for example usage (and also note you can set multiple cookies in a single response by calling `res.cookie` multiple times).

For our uses right now, we'll just note that `res.cookie` takes *at least* 2 arguments:

1. The `name` of the cookie.
2. The `value` to set it to.

So every time whoever the response is sent to makes a request, they're going to send their cookie up so the server will have all of that data available to it. So the example of using the form to submit a username and password and subsequently getting the values off `req.body`

```javascript
const { username, password } = req.body;
```

can now be used inside of our route in a conditional way to set a cookie:

```javascript
app.post('/process_login', (req, res, next) => {
  const { username, password } = req.body;
  if (password = 'x') {
    res.cookie('username', username);
    res.redirect('/welcome');
  }
  res.json(req.body)
})
```

So once the form is submitted, the application-level middleware `app.use(express.urlencoded({extended: false}))` parses the HTTP message and tacks the data onto a `body` object which is appended to the `request` object before our route middleware `app.post('/process_login', ...)` deals with the `request`. If the password supplied has a value of `'x'`, then we will stash the `username` in a cookie so that going forward we can access that username value on any page and we don't need to remember it. Why does this matter? Well, if the user comes back or goes to a new path, then we will not have access to `req.body` anymore. We get a totally new response and a totally new request. Remember that's part of HTTP. It's stateless. There's no dialogue going on. It's just the one-off process. You get one request and you get one response. And then we start completely over. So that is what the cookie is for. Once we've stashed the `username` in the cookie, we can call `res.redirect` to send the user where we want them to go.

From [the docs](https://expressjs.com/en/4x/api.html#res.redirect) for `res.redirect([status,] path)`: Redirects to the URL derived from the specified `path`, with specified `status`, a positive integer that corresponds to an [HTTP status code](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) . If not specified, `status` defaults to “302 “Found”. (See the docs for more detail and examples.)

The essential fact is that `res.redirect` takes one argument (unless we give it the optional first one as a status code as specified above): where to send the browser. We shall, for the time being, simply have `res.redirect('/welcome')`. So to recap:

```javascript
app.post('/process_login', (req, res, next) => {
  const { username, password } = req.body;
  if (password === 'x') {
    res.cookie('username', username);
    res.redirect('/welcome');
  }
  // res.json(req.body) // <-- Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client 
})
```

When the user submits the form, if their password is `x`, then we will store their username in a cookie with `name` of `username` with value of `username`. We will then redirect the user to the `/welcome` route. We can add some more conditional logic to ensure they are redirected somewhere else (programmatically instead of manually trying to move around using the URL) if their password is not `x`:

```javascript
app.post('/process_login', (req, res, next) => {
  const { username, password } = req.body;
  if (password === 'x') {
    res.cookie('username', username);
    res.cookie('somethingelse', 88);
    res.redirect('/welcome');
  } else {
    res.redirect('/login?msg=fail');
  }
})
```

So if the user did not submit the form with a password of `x` then we will send them right back to the `/login` page but we're going to put in a little query string `?msg=fail` as well (which we will get to momentarily). 

To review at a higher level: The `/process_login` is a `post` route and note that the user will *never* see this page. The browser will never see this page. The user will come here (i.e., to this route) as soon as they submit the form, but there is no `res.render`, `res.send`, or `res.json`. There are only `res.direct` constructs. This means the user will hit this route after submitting the form just long enough to check if the password is `x` or not and then we'll redirect them to either `/welcome` or back to `/login` (with the query string `?msg=fail`). Both redirects will result in `GET` requests to either `/welcome` or `/login`.

| Note about `res.redirect` and the optional first argument of an HTTP `status` code |
| :--- |
| See the section note following this one for more information about `res.redirect` and how to specify what HTTP method you want to be used for your redirect.<br><br>Super short version: `302` (the default value) or setting `303` manually will result in a `GET` request to the specified route while setting `307` will result in the HTTP method being handled on the current route being used for the route you are redirecting to (i.e., setting `307` will result in `POST -> POST`, `PUT -> PUT`, `GET -> GET`, etc.).<br><br>Longer version: your redirect will either be a `GET` request (due to using the default value of `302` for the optional first argument to `res.redirect` as an HTTP status code or manually specifying `303`) **OR** the same kind of request for whatever request you are currently handling by specifying `307` for the optional `status` value (i.e., using `res.redirect(307, '/something')` from within a HTTP `METHOD` request to a certain route (e.g., `PUT`, `POST`, etc.) will result in another HTTP request of the same `METHOD` to another specified route).<br><br>As a simple example, if we are handling `app.METHOD('/login', ...)` and somewhere in `...` we want to redirect the user to `/welcome` using `res.redirect(status, '\welcome')`, then we can not set `status` at all (in which case `302` will be used by default and a subsequent `GET` request will be issued to the `/welcome` route), we can set `status` to `303` which will more explicitly ensure we issue a `GET` request to `'/welcome'`, or finally we can set `status` to `307` which will explicitly ensure we issue a `METHOD` request to `'/welcome'` (i.e., the same kind of request we were presently handling). Of course, other `status` values can be used, but these will typically be the ones you want to use. Check out the [HTTP Status Code](https://httpstatuses.com/) site for more info and first note that `3xx` relates to redirections. |

The point of all of the above is to note that there's no real "option" for the user in the `/process_login` route we've created above. This post route's *only* purpose is for the user to submit data and then for us to decide what to do with the user (i.e., a redirection of some sort or something else) based on that data. Remember that's what a post route is for: It means we want to submit some data (i.e., we want to accept some data from the user and then send them on to where they belong).

Let's revisit the code we currently have:

```javascript
app.post('/process_login', (req, res, next) => {
  const { username, password } = req.body;
  if (password === 'x') {
    res.cookie('username', username);
    res.cookie('somethingelse', 88);
    res.redirect('/welcome');
  } else {
    res.redirect('/login?msg=fail');
  }
})
```

If the user has password `x` and is redirected to `/welcome` using a `GET` request, then we need to set up some middleware to handle the `GET` request at the `/welcome` route. Here's the `welcome.ejs` view:

``` HTML
<link rel="stylesheet" type="text/css" href="/stylesheets/styles.css">
<div class="login-page">
  <div class="form">
    <h1>Welcome back to the site, <%= username %>!</h1>
    <p><a href="/logout">Log out</a></p>
  </div>
</div>
```

If we want to put the actual `username` of the user in the DOM, then we need to be able to access it. Well where is the `username` for us to access it? We stored it in a cookie when handling the `POST` request to the `process_login` route (note that the `username` is made available to us upon submission of the form via `req.body`): 

```javascript
app.post('/process_login', (req, res, next) => {
  const { username, password } = req.body;
  if (password === 'x') {
    res.cookie('username', username);
    res.cookie('somethingelse', 88);
    res.redirect(307, '/welcome');
  } else {
    res.redirect('/login?msg=fail');
  }
})
```

This presents an interesting issue for us when setting up the middleware for `GET` requests to `/welcome`:

```javascript
app.get('/welcome', (req, res, next) => {
  res.render('welcome', {
    username: req.body.username
  });
})
```

The above route handler will fail as it is currently written. Why? Well, there's not actually any `username` on `req.body` at this point. Why? Because a new `GET` request was made to `/welcome` where the `username` is no longer available! That is, `username` is not being sent through the `body` of the `request` object anymore--that happened on the first request. As just noted, the `GET` request to `/welcome` coming from the redirect is a totally new request now. There is no `username` to access! This is why we stored the `username` in a cookie when `username` actually was available to us on the request body: 

```javascript
const { username, password } = req.body;
...
res.cookie('username', username);
```

So now instead of sending `req.body.username`, which is empty, we will instead send `req.cookies.username`:

```javascript
app.get('/welcome', (req, res, next) => {
  res.render('welcome', {
    username: req.cookies.username
  });
})
```

So the `req.cookies` object will have a property for every named cookie that has been set. The reason we have a `req.cookies.username` to access is because of setting it previously with `res.cookie('username', username);`. Note that you set cookies in a singular fashion (i.e., `res.cookie(name, value)`) while they are available in a plural fashion as key-value pairs on the `req.cookies` object. 

Before we actually start using information from the cookies we set, we will need a third-party module to parse the `Cookie` header from the HTTP message (much the same as we needed `app.use(express.json())` and `app.use(urlencoded.json())` to help parse the body of a request after a form submission so we could easily grab the user-submitted data ... we cannot use this middleware here because the cookies are coming across in the `Cookie` header of the HTTP message and not the body). We will use the [cookie-parser](https://www.npmjs.com/package/cookie-parser) package which states the following at the top of its documentation:

Parse `Cookie` header and populate `req.cookies` with an object keyed by the cookie names. Optionally you may enable signed cookie support by passing a `secret` string, which assigns `req.secret` so it may be used by other middleware.

Now from our `welcome.ejs` view we will include the ability for the user to logout if they so desire:

``` HTML
<p><a href="/logout">Log out</a></p>
```

Now we need to make a route for `/logout`, specifically one that accounts for a `GET` request because an anchor tag *always* points to a `GET` route. When the user logs out, we will want to clear their `username` cookie using `res.clearCookie(name [, options])`.

| Note from [the docs](https://expressjs.com/en/4x/api.html#res.clearCookie) on `res.clearCookie(name [, options])` |
| :--- |
| Clears the cookie specified by `name`. For details about the `options` object, see [res.cookie()](https://expressjs.com/en/4x/api.html#res.cookie).<br><br>Web browsers and other compliant clients will only clear the cookie if the given `options` is identical to those given to [res.cookie()](https://expressjs.com/en/4x/api.html#res.cookie), excluding `expires` and `maxAge`.<br><br>**Example:** `res.cookie('name', 'tobi', { path: '/admin' })` and `res.clearCookie('name', { path: '/admin' })`. |

In our case, we will simply want to clear the `username` cookie like so:

```javascript
res.clearCookie('username')
```

Note that you can only clear cookies individuall by name. If you wanted to clear all cookies in one go, you could do something like the following:

```javascript
for (let property in req.cookies) {
  res.clearCookie(property)
}
```

Further still, if you only wanted to clear certain kinds of cookies that you had set, then you could add some conditional logic to specify that as well. Whatever you do, note that the cookies will still be available on the Express server but removed from the client (i.e., the user's computer or web browser). They will just no longer be available on the web browser. To see the difference, do something like the following:

```javascript
app.get('/logout', (req, res, next) => {
  console.log('Cookies on server before clearing: ', req.cookies);
  res.clearCookie('username')
  console.log('Cookies on server after clearing: ', req.cookies);
  res.redirect(303, '/login');
})
```

Now go to the `/login` route and enter username `Bill` and password `x`. Before logging out, in your *web browser console* (i.e., Chrome, Safari, etc., and not Node.js) type `document.cookie` and press enter. You will see `"username=Bill"`. Now click the log out button. 

In your Node.js console you will see something like the following get logged:

```
Look at the cookies at the beginning:  { username: 'Bill' }
Look at the cookies at the end:  { username: 'Bill' }
```

If you hope back over to the browser console and type `document.cookie` and press enter then you will see `""`.

It is good practice to clear unnecessary cookies. It is good to get it out of their system so you are not clogging it up and so that sensitive data is not available later on. The user can refresh and refresh their page and whatever cookies are associated with them are going nowhere.

---

</details>

<details><summary> <strong>Some notes about <code>res.redirect([status,] path)</code> and the optional <code>status</code> value</strong></summary>

First, take a look at [the Express docs](https://expressjs.com/en/4x/api.html#res.redirect) for `res.redirect`. Second, realize that [HTTP status codes](https://httpstatuses.com/) are actually quite important. Third, note that we should really probably *always* specify the `status` value to most likely be `303` (when we want our redirect to issue a `GET` request) or `307` (when we want our redirect to use the same method request as was being handled before the redirect). Of course, other  status values can be used, but `303` and `307` will be the most common.

Take a look at [this *awesome* answer](https://stackoverflow.com/a/48979655/5209533) on Stack Overflow. Some of the highlights:

- The `303 "See Other"` redirect should always be followed by a `GET` (or `HEAD`) request (according to the HTTP/1.1 spec), not `PUT` or anything else. See [RFC 7231, Section 6.4.4](https://tools.ietf.org/html/rfc7231#section-6.4):
- The other popular types of redirects - `301 "Moved Permanently"` and `302 "Found"` in practice usually work contrary to the spec as if they were `303 "See Other"` and so a `GET` request is made. From [this answer](https://stackoverflow.com/a/33215393/5209533) (noting how `302` statuses were originally implemented incorrectly by browsers so codes `303` and `307` largely exist for this reason): For historical reasons, a user agent MAY change the request method from POST to GET for the subsequent request. If this behavior is undesired, the 307 (Temporary Redirect) status code can be used instead.
- Excerpt [from Wikipedia](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes): This [i.e., what's touched on in the point above] is an example of **industry practice contradicting the standard**. The HTTP/1.0 specification (RFC 1945) required the client to perform a temporary redirect (the original describing phrase was "Moved Temporarily"), but popular browsers implemented 302 with the functionality of a 303 See Other. Therefore, HTTP/1.1 added status codes 303 and 307 to distinguish between the two behaviours. However, some Web applications and frameworks use the 302 status code as if it were the 303.
- There is a `307 Temporary Redirect` (since HTTP/1.1) but it explicitly disallows changing of the HTTP method, so you can only redirect a `POST` to `POST`, a `PUT` to `PUT`, etc., which can sometimes be useful.

Long story short: It's a good idea to explicitly pass the `status` value to `res.redirect` even though it is optional, and you should pass `303` if you want your redirect to issue a `GET` request or `307` if you want your redirect to issue the same kind of request currently being handled up to the redirect.

---

</details>

<details><summary> <strong>Getting data from the query string: <code>req.query</code></strong></summary>

Recall how we handled a `POST` to the `process_login` route:

```javascript
app.post('/process_login', (req, res, next) => {
  const { username, password } = req.body;
  if (password === 'x') {
    res.cookie('username', username);
    res.redirect(303, '/welcome');
  } else {
    res.redirect(303, '/login?msg=fail');
  }
})
```

We've explored in detail what happens when the password is `x`, but what happens when the password isn't `x`? It's clear we redirect the user back to the `/login` route using a `GET` request, but we tack something else onto the route: `?msg=fail`. What's the deal with the `?`? 

The `?` is a special character in a URL. The `?` is almost like a delimiter in a URL that say, "Every part after me is a part of the query string. Everything before me is part of the actual path, the domain, the protocol, etc. So the web server will stop caring *period* from `?` onward. The `?` denotes the beginning of the query string and then you have key-value pairs after it. If you want to have more than one key-value pair (we only have one with `msg=fail`), then we can use an ampersand (i.e., `&`) to denote another key-value pair in the query string. For example, we could have `'/login?msg=fail&consolation=boohoo'`. So the keys here are `msg` and `consolation` while their values are `fail` and `boohoo`, respectively. 

Definitely read [the Wiki](https://en.wikipedia.org/wiki/Query_string) entry on query strings. It's useful to know their history, background, and usage. Also make sure to read [the docs](https://expressjs.com/en/4x/api.html#req.query) on `req.query` (all included below because of some of the useful examples the docs include):

---

**From the docs:** This property (i.e., `req.query`) is an object containing a property for each query string parameter in the route. When [query parser](https://expressjs.com/en/4x/api.html#app.settings.table) is set to disabled, it is an empty object {}, otherwise it is the result of the configured query parser.

*Note:* As `req.query`’s shape is based on user-controlled input, all properties and values in this object are untrusted and should be validated before trusting. For example, `req.query.foo.toString()` may fail in multiple ways, for example `foo` may not be there or may not be a string, and `toString` may not be a function and instead a string or other user-input.

*Examples:*

```javascript
// GET /search?q=tobi+ferret
console.dir(req.query.q)
// => 'tobi ferret'

// GET /shoes?order=desc&shoe[color]=blue&shoe[type]=converse
console.dir(req.query.order)
// => 'desc'

console.dir(req.query.shoe.color)
// => 'blue'

console.dir(req.query.shoe.type)
// => 'converse'

// GET /shoes?color[]=blue&color[]=black&color[]=red
console.dir(req.query.color)
// => ['blue', 'black', 'red']
```

---

You can build fairly complicated query strings if you so desire, but that shouldn't be your goal. As an example, consider the following needlessly complicated query string:

```?typical=example&some+space=not+so+common&myFriends=Oscar&myFriends=Andy&myFriends=Angela&myShoe[color]=brown&myShoe[type]=dress&myShoe[brand]=Gucci&myNested[firstNest]=littleNest&myNested[secondNest][unnecessary]=true&myNested[secondNest][useful]=probably+not
```

If we untangle it to make some sense of it (the "untangled" version below can't be used because of newline issues):

```BASH
?
# Typical use case
typical=example
# Include some spaces (more typical of values than keys)
&some+space=not+so+common
# Build a myFriends array
&myFriends=Oscar
&myFriends=Andy
&myFriends=Angela
# Build a myShoe object
&myShoe[color]=brown
&myShoe[type]=dress
&myShoe[brand]=Gucci
# Build an object with an object inside it
&myNested[firstNest]=littleNest
&myNested[secondNest][unnecessary]=true
&myNested[secondNest][useful]=probably+not
```

The result upon parsing is the `req.query` object:

```
{
  typical: 'example',
  'some space': 'not so common',
  myFriends: [ 'Oscar', 'Andy', 'Angela' ],
  myShoe: { color: 'brown', type: 'dress', brand: 'Gucci' },
  myNested: {
    firstNest: 'littleNest',
    secondNest: { unnecessary: 'true', useful: 'probably not' }
  }
}
```

The point is that the query string is a very common way of passing data around the web. Generally speaking, the query string is where you put insecure data. So you don't care about that data. If someone is watching the HTTP traffic on a route or something like that they'll be able to see everything go through in terms of the path requested and the following query string, but they won't be able to see the body (that will be encrypted so long as you are using HTTPS), but they will be able to see the URLs being passed around. So you would never want to put a password or any sensitive data in the query string. 

It's very easy for the browser to pull stuff out of the URL. The browser can't pull stuff out of the HTTP body because that's already happened. But the browser can see the URL so the browser (i.e., meaning front-end JavaScript) can pull data out of the query string if it needs to. The server can pull it out too which is what we are just about to do. 

To illustrate some of this, go to [Google](https://www.google.com/) and submit a search for `Udemy`. If you look at the URL *after* your search is submitted, then you will see something like the following (of course different for you):

```
https://www.google.com/search?safe=off&source=hp&ei=fEeXXrWqLNeD9PwP8OalmAU&q=Udemy&oq=Udemy&gs_lcp=CgZwc3ktYWIQAzICCAAyBQgAEIMBMgIIADICCAAyAggAMgIIADICCAAyAggAMgUIABCDATIFCAAQgwFKFwgXEhMxMWcxMDRnODlnNzRnMTQyZzc5Sg8IGBILMWcxZzFnMWcxZzFQ0sIDWOvGA2CnyQNoAHAAeAGAAYkBiAGrBJIBAzYuMZgBAKABAaoBB2d3cy13aXqwAQA&sclient=psy-ab&ved=0ahUKEwi12Lu0_eroAhXXAZ0JHXBzCVMQ4dUDCAk&uact=5
```

And if we break down the query string:

``` BASH
https://www.google.com/search # protocol (HTTPS), subdomain (www), root domain (google), path (search)
? # start of query string
safe=off # maybe filtering out some undesirable results
&source=hp # some internal meaning to Google (probably meaning user searched from home page)
&ei=fEeXXrWqLNeD9PwP8OalmAU # also some internal meaning to Google
&q=Udemy # this is what we care about
&oq=Udemy
&gs_lcp=CgZwc3ktYWIQAzICCAAyBQgAEIMBMgIIADICCAAyAggAMgIIADICCAAyAggAMgUIABCDATIFCAAQgwFKFwgXEhMxMWcxMDRnODlnNzRnMTQyZzc5Sg8IGBILMWcxZzFnMWcxZzFQ0sIDWOvGA2CnyQNoAHAAeAGAAYkBiAGrBJIBAzYuMZgBAKABAaoBB2d3cy13aXqwAQA&sclient=psy-ab&ved=0ahUKEwi12Lu0_eroAhXXAZ0JHXBzCVMQ4dUDCAk&uact=5 # another internal
```

You could just as well enter the following for our own desired results: `https://www.google.com/search?q=Udemy`. All of the other stuff was for Google. They were constructing their own URL. And that is precisely what we are doing with `res.redirect`. Using something like `res.redirect(303, '/login?msg=fail&test=hello');` lets us know what happened (i.e., if the user ended up back at the login page, then we can take action and tack on useful information to the query string).

What could we want to use the query string for? In our case, we are using a view engine, so we are going to want to let the user know that their login failed, but, like in the case of Google, even if this is just an API where you're not using Express as a view engine (think an API for a single page application using React or something entirely different), you can still *use* the information from the query string. If inside the query string the `msg` property happens to equal `fail`, then we will want to let the user know on the screen that something happened. 

One sample use case you can bake into your applications is something like the following for managing login attempts/failures. Say we have the following middleware placed above any of our routes in our code (i.e., to ensure it runs before any HTTP requests are handled):

```javascript
app.use((req, res, next) => {
  if(req.query.msg === 'fail') {
    res.locals.msg = 'Sorry. This username and password combination does not exist.';
  } else {
    res.locals.msg = '';
  }
  next();
})
```

The above code reflects our desire for the following: If the query string has a `msg` property with its value as `fail`, then we want to do is set a local variable that the view engine will be able to see, and the easiest way to do that is to use `res.locals` because the view engine has access to that as does every other piece of middleware throughout. So if someone happens to need to know, for any reason, that the user tried to log in and couldn't (e.g., maybe we have a counter somewhere to try to prevent the user from being able to log in more than 3 times, etc.). The point is we will set `msg` on `res.locals` to indicate an error if there is a failure to log in and otherwise be set to an empty string.

Note that by using this middleware in this way (i.e., at the application level so it runs whenever *any* type of request is issued) we *do not* have to pass `msg` as the second argument to `res.render` to be made available as a local variable to the view that is rendered (because we *always* have access to `res.locals` via the `locals` object in our view). 

---

</details>

<details><summary> <strong>Getting data from parameters (URL wildcards): <code>req.params</code> and <code>and req.param()</code></strong></summary>

As noted in the previous note, the query string is a great way of passing insensitive data through the URL. Another way of passing insensitive data through the URL is through parameters or sort of like through wildcard pieces of the path itself. 

Suppose our `welcome.ejs` view looked like the following:

``` HTML
<link rel="stylesheet" type="text/css" href="/stylesheets/styles.css">
<div class="login-page">
  <div class="form">
    <h1>Welcome back to the site, <%= username %>!</h1>
    <a href="/story/1">Story 1</a>
    <a href="/story/2">Story 2</a>
    <a href="/story/3">Story 3</a>
    <p><a href="/logout">Log out</a></p>
  </div>
</div>
```

So we want to give the user some story link options upon logging in. Remember that all anchor tags point toward a `GET` request and right now we don't have a route to handle anything going to `/story`. In fact, we run into a bit of a problem here because presumably each `story` will be roughly similar, but of course we have unique stories themselves. Are we going to write individual route handlers for *every* individual story? Of course not. Imagine the pain that would go into architecting a site that had hundreds of thousands of different routes for individual items that were all structurally similar (e.g., a blog posts):

```javascript
app.get('/story/1', (req, res, next) => {
  res.send(`<h1>Story 1</h1>`)
})

app.get('/story/2', (req, res, next) => {
  res.send(`<h1>Story 2</h1>`)
})

app.get('/story/3', (req, res, next) => {
  res.send(`<h1>Story 3</h1>`)
})
```

And that's only with 3 stories! Again, imagine having thousands of stories. Technically, the above code accomplishes what we want. But it stinks. It will be a major headache to manage. It's clogging up our actual routes (three routes that all basically do the same thing), and more to the point, we don't want `res.send` for some piddly HTML. We want to use `res.render` when using a view engine or `res.json` if we're using React, Angular, Vue, or something similar on the other end. So this is not tenable. We're going to make copy/paste errors or we'll need one view that can manage all of it, or we'll want one `res.json` to be able to handle all of it. So rather than getting really fancy with some middleware, Express already has something built in to handle this very thing.

Of course, we will certainly have to come up with a route to handle `GET` requests to `/story`, but we can do so in a way that accounts for individual stories:

```javascript
app.get('/story/:storyId', (req, res, next) => {
  res.send(`<h1>Story 1</h1>`)
})
```

In a route, anytime something has a `:` in front of it is a wildcard. In the case above, `storyId` is the wildcard, and `storyId` (or whatever you choose to name the wildcard) will match *anything* in the slot following the `:` (unless you append a regular expression following the wildcard name in parentheses which is addressed later in this note--you would do this to restrict what kind of wildcard matching you want whether it be only digits, certain kinds of strings, etc.; if a regular expression is added onto a wildcard and the match fails then nothing will be added on the `req.params` object). What this means is that the route above will trigger if the user goes to `/story/<anything-else>`; that is, it will trigger on `story/1`, `story/2`, `story/3`, and even `/story/hubbadubbabubbub`. Anything in the wildcard spot will be matched--we don't care what it is. We just care that they went to `/story` followed by something else. 

So how do we access the wildcard information? The `req.params` object always exists (its default value is `{}`). As always, visit [the docs](https://expressjs.com/en/4x/api.html#req.params) to find out more. 

---

**From the docs:** This property (i.e., `req.params`) is an object containing properties mapped to the [named route “parameters”](https://expressjs.com/en/guide/routing.html#route-parameters). For example, if you have the route `/user/:name`, then the “name” property is available as `req.params.name`. This object defaults to `{}`.

```javascript
// GET /user/tj
console.dir(req.params.name)
// => 'tj'
```

When you use a regular expression for the route definition, capture groups are provided in the array using `req.params[n]`, where `n` is the nth capture group. This rule is applied to unnamed wild card matches with string routes such as `/file/*`:

```javascript
// GET /file/javascripts/jquery.js
console.dir(req.params[0])
// => 'javascripts/jquery.js'
```

If you need to make changes to a key in `req.params`, use the [app.param](https://expressjs.com/en/4x/api.html#app.param) handler. Changes are applicable only to [parameters](https://expressjs.com/en/guide/routing.html#route-parameters) already defined in the route path.

Any changes made to the `req.params` object in a middleware or route handler will be reset.

NOTE: Express automatically decodes the values in `req.params` (using `decodeURIComponent`).

---

Make sure to read the documentation on [route parameters](https://expressjs.com/en/guide/routing.html#route-parameters) in the guide to routing. Lots of useful information there. In particular, the name of route parameters must be made up of "word characters" (i.e., `[A-Za-z0-9_]` or `\w` in regex). Additionally, to have more control over the exact string that can be matched by a route parameter, you can append a regular expression in parentheses at the end of the wildcard:

```
Route path: /user/:userId(\d+)
Request URL: http://localhost:3000/user/42
req.params: {"userId": "42"}
```

Returning to our own use case, we could have something like the following:

```javascript
app.get('/story/:storyId', (req, res, next) => {
  const {storyId} = req.params;
  // simulate dynamic link generation (would likely be a pull from a database)
  const link = Math.random();
  res.send(`<h1>Story ${storyId}. <a href="/story/${storyId}/${link}">[Read more.]</a></h1>`)
})
```

So we send the user some HTML that mentions their requested story and its ID. Further suppose we wanted to have an option for the reader to read even more about their story. Then we could link them to another route that made further use of the parameters:

```javascript
app.get('/story/:storyId/:link', (req, res, next) => {
  const {storyId, link} = req.params;
  res.send(`<h1>This is the link: ${link}. You are now reading more about story ${storyId}.</h1>`)
})
```

Note that `req.params` contains *all* the wildcards in the route, namely `storyId` and `link` in the example just above, but it could be a lot more. The second route above will only trigger if we have `/story/<something>/<something>` while the first route will only trigger at `/story/<something>`. 

To see this in action in the real world, consider going to an NFL story through ESPN:

```
https://www.espn.com/nfl/story/_/id/29039828/sources-member-chargers-tests-positive-covid-19
```

And go to another NFL story:

```
https://www.espn.com/nfl/story/_/id/29039856/green-bay-packers-hall-famer-willie-davis-dies-85
```

The `/nfl/story` route is going to be incredibly common at ESPN. The catch here is what comes after the `id`. They developers are going to pull out the story ID the same way we are. Basically for all of the NFL stories we will get the same route except a different `id` and a different `title` after the `id`. This is very useful and very powerful. Query strings are ugly and sort of not cool, whereas keeping your URLs nice and clean is very friendly and these are easy to link to other people because they follow a natural convention. 

It's worth noting that we have to be at least somewhat mindful when organizing our routes. For example, we we wouldn't want to have something like the following:

```javascript
app.get('/story/:storyId', (req, res, next) => {
  const {storyId} = req.params;
  // simulate dynamic link generation (would likely be a pull from a database)
  const restOfStoryLink = Math.random();
  res.send(`<h1>Story ${storyId}. <a href="/story/${storyId}/${restOfStoryLink}">[Read more.]</a></h1>`)
})

// The below route handler will never run as it is because the route above is matched first
// We could throw a next() on at the end of the above route but that's very poor design
app.get('/story/:blogId', (req, res, next) => {
  ...
})
```

What you can do if you need something sort of similar to what's communicated above is use `app.param`. As always, [the docs](https://expressjs.com/en/4x/api.html#app.param) have a lot more information. The basic info is that `app.param([name], callback)` takes two arguments:

1. A `param` to look for in the route
2. The callback to run with the usual suspects (i.e., `req`, `res`, `next`) but also a fourth parameter that is the *value* of the `param` from the first argument. 

The idea is that instead of something like 

```javascript
app.get('/story/:storyId', (req, res, next) => {
  // ...
})
```

or

```javascript
app.get('/story/:blogId', (req, res, next) => {
  // ...
})
```

where we tried to handle the story based on whether or not we were dealing with a `storyId` or a `blogId` on the `/story` route, we could bundle the functionality of both into something like 

```javascript
app.get('/story/:generalStoryId', (req, res, next) => {
  // ...
})
```

but first use `app.param` to effect how the `/story/:generalStoryId` route will behave.

To make it clearer (a code snippet will follow this explanation): Someone shows up on port 3000 with an HTTP request (this kicks everything into action on our server). Before we actually get to any route, `app.param` will run (make sure you place anything using `app.param` *before* your route handlers). We want to check if the route that is about to run (`/story/:generalStoryId` in our case) has the specified parameter in it (in our case `generalStoryId`). That means we want Express to go looking for the various `app.METHOD` handlers and check to see if the one that is going to run has `:<first-arg-to-app.param()>` anywhere inside of the route parameters: if it does, then the `app.param` callback function will run. 

If we have a qualifier, as we would if we had a request to the `/story/<something>` route and had the following in our code

```javascript
app.param('generalStoryId', (req, res, next, generalStoryId) => {
  // ...
})

app.get('/story/:generalStoryId', (req, res, next) => {
  // ...
})
```

then `app.param` gives us a chance to modify the request/response object however we want before the route handler for `'/story/:generalStoryId'` actually executes. As noted above in the skeleton of `app.param`, the usual arguments for the middleware callback function are `req`, `res`, and `next`, but with `app.param` we also get a fourth argument, namely the *value* of the parameter used as the first argument to `app.param`. So the `generalStoryId` in `(req, res, next, generalStoryId)` above is really equivalent to `req.params.generalStoryId` in the actual request object. So it saves you a little bit of typing basically. And you can do anything you want inside of this callback function (just make sure you call `next` at the end of it!). This is very nice as a kind of internal piece of middleware so that instead of having to do a bunch of string-checking or regular expressions to try to figure out whether or not the user is at a route that would qualify for

```javascript
app.get('/story/:storyId', (req, res, next) => {
  // ...
})
```

or

```javascript
app.get('/story/:blogId', (req, res, next) => {
  // ...
})
```

we can simply handle our conditional logic in `app.param` and then have a single route handler to take care of things.

---

#### Example

To make the above usage clearer, consider the following very contrived example:

```javascript
app.param('generalStoryId', (req, res, next, generalStoryId) => {
  console.log('Param called: ', generalStoryId);
  /* The conditional logic:
    - We can modify the request/response objects how we please before they get to our desired route
    - We can then make use of our logic here in our desired route 
    - For example, you may want to set any number of local variables or whatever
  */
  switch(true){
    case(generalStoryId > 0 && generalStoryId < 366):
      res.locals.storyType = 'daily';
      break
    case(generalStoryId < 1000000):
      res.locals.storyType = 'news';
      break
    case(generalStoryId < 1000000000):
      res.locals.storyType = 'blog';
      break
    default:
      res.locals.storyType = '';
      break
  }
  next();
})

app.get('/story/:generalStoryId', (req, res, next) => {
  const { generalStoryId } = req.params;
  const { storyType } = res.locals;
  // simulate dynamic link generation (would likely be a pull from a database)
  res.locals.restOfStoryLink = Math.random(); // <-- maybe something from DB
  res.locals.generalStoryId = generalStoryId;
  switch(storyType){
    case('daily'):
      res.render('daily');
      break;
    case('news'):
      res.render('news');
      break;
    case('blog'):
      res.render('blog');
      break;
    default:
      res.send(`<h1>Woops! Looks like this story does not exist.</h1>`)
      break;
  }
})

app.get('/story/:generalStoryId/:link', (req, res, next) => {
  console.log('The params: ', req.params)
  const {generalStoryId, link} = req.params;
  // the below would likely be res.render based on the link pulled from the DB somehow
  res.send(`<h1>This is the link: ${link}. You are now reading more about story ${generalStoryId}.</h1>`)
})
```

The basic idea is that whenever a request is made to the route `/story/<something>`, how we handle this request is informed by `app.param`. Whatever the `something` is will determine what view is rendered for the user or where they might be sent by

```javascript
app.get('/story/:generalStoryId', (req, res, next) => {
  // ...
})
```

The above contrived use case is to have a `daily` story rendered if the story id is between 1 and 365, inclusive, etc. `app.param` can be very useful if you're dedicated to representing differently classed things after a single path name. And one of the views could look like 

``` HTML
<link rel="stylesheet" type="text/css" href="/stylesheets/styles.css">
<div class="login-page">
  <div class="form">
    <p>Welcome to your <%= storyType %> story! You are reading about story <%= generalStoryId %> </p>
    <p>Click <a href='/story/<%=generalStoryId%>/<%=restOfStoryLink%>'>this link</a> to read more.</p>
  </div>
</div>
```

and another view could look drastically different.

---

</details>

<details><summary> <strong>Sending files and dealing with "headers already sent" error</strong></summary>

We are now going to look at how to send files and what to do if the headers have already been sent (at least a use case for how to handle that). All of this will make more sense once you actually build something more sizable.

To simulate a scenario where you might want to send a file manually (typically you would want to generate some kinds of files on the fly such as bank statements and the like), we can create a `userStatements` folder at the root level in our project directory and drop a [sample bank statement](https://en.wikipedia.org/wiki/Bank_statement#/media/File:BankStatementChequing.png) from Wikipedia into it and title it `BankStatementAndChecking.png`. 

Maybe instead of our site being a blog site of some sort it is a vacation site, where maybe you buy stuff and they store stuff for you, but maybe you want to see your statement too. We can copy the contents of `welcome.ejs` into a new `welcomeBank.ejs` view in the `views` folder and then change it to be the following:

```javascript
<link rel="stylesheet" type="text/css" href="/stylesheets/styles.css">
<div class="login-page">
  <div class="form">
    <h1>Welcome back to the site, <%= username %>!</h1>
    <a href="/story/1">Story 1</a>
    <a href="/story/2">Story 2</a>
    <a href="/story/3">Story 3</a>
    <a href="/statement">Download your statement</a>
    <p><a href="/logout">Log out</a></p>
  </div>
</div>
```

You have no doubt seen something like the above where you could download a statement or something else. You would expect a PDF probably or something similar. In a production environment, these kinds of files would be generated on the fly--you wouldn't have a folder with a pre-built PDF or PNG of every user's activity (most users wouldn't even want it so it would be an unnecessary strain in all regards). We're not going to dynamically generate images or documents or anything like that right now so we're just going to use a dummy folder with a dummy picture in it for right now. Based on the above code, we now need a `GET` route for `/statement`. 
 
It should be clear that such content (i.e., a bank statement) could *never* be put in the `public` folder. It contains sensitive data! This data can only be sent back in a public manner. So what are our options? Well, we could try `res.sendFile` like so:

```javascript
res.sendFile(path.join(__dirname, 'userStatements/BankStatementAndChecking.png'))
```

So with `path` we will go to the file system, with `__dirname` we'll grab the directory our server script is in, grab the particular file we are interested in, and send that back across the wire (make sure you have the `path` module included). What might be the problem with this? The problem is that with `sendFile` the browser is going to interpret that as, "Oh, I'm supposed to load this file up." So if you do this then the browser will simply load up the image (i.e., your screen will simply be the image). And maybe that's what you want, but if the user wants to download the image then you've just forced them to have to right click it and save as and so forth. Not good user experience! 

If we want to get more insight about how to possibly make a better user experience, we can head over to Postman and send a `GET` request to `http://localhost:3000/statement` and then inspect the headers. We will see a `Content-Type` header with a value of `image/png`. We will see how to use this in just a second. The thing to know is that the response object actually has a download method: 

``` BASH
res.download(path [, filename] [, options] [, fn])
```

As always, [the docs](https://expressjs.com/en/4x/api.html#res.download) will be our friend here. This is worth reproducing in full below.

---

**From the docs:** Beginning note: The optional `options` argument is supported by Express v4.16.0 onwards.

This (i.e., `res.download`) transfers the file at `path` as an “attachment”. Typically, browsers will prompt the user for download. By default, the `Content-Disposition` header “filename=” parameter is `path` (this typically appears in the browser dialog). Override this default with the `filename` parameter.

When an error occurs or transfer is complete, the method calls the optional callback function `fn`. This method uses [res.sendFile()](https://expressjs.com/en/4x/api.html#res.sendFile) to transfer the file.

The optional `options` argument passes through to the underlying [res.sendFile()](https://expressjs.com/en/4x/api.html#res.sendFile) call, and takes the exact same parameters.

```javascript
res.download('/report-12345.pdf')

res.download('/report-12345.pdf', 'report.pdf')

res.download('/report-12345.pdf', 'report.pdf', function (err) {
  if (err) {
    // Handle error, but keep in mind the response may be partially-sent
    // so check res.headersSent
  } else {
    // decrement a download credit, etc.
  }
})
```

---

Basically, the simple use for `res.download` includes passing two arguments:

1. The filename
2. Optionally, what you want the filename to download as (i.e., a different name than what it actually is)

We have the first part already in `path.join(__dirname, 'userStatements/BankStatementAndChecking.png')`. For the second part, maybe we don't want it coming through as `BankStatementAndCheking.png`. Maybe we want it as `JimsStatement.png` or maybe we want to even personalize it using a cookie set earlier when the user logged in:

```javascript
const {username} = req.cookies;
res.download(path.join(__dirname, 'userStatements/BankStatementAndChecking.png'), `${username}sStatement.png`)
```

If we put this in our file right now, to see the change reflected, we need to clear the cache and hard reload. In Chrome, open the console and then right-click the refresh wheel and choose "Empty Cache and Hard Reload". You will not get that option unless you have the console open. (We have to do this because we need to break the cache because Chrome has decided how to handle `/statement`.) 

If we again look at this happening in Postman, then again we see `Content-Type` header with `image/png` as the value, but what we get now that we *did not* get before is a new header `Content-Disposition`:

``` BASH
Content-Disposition -> attachment; filename="FredsStatement.png"
```

This was not set last time and now it is--this time it is set to attachment and it has a filename set for `FredsStatement.png`. If you are using Postman to simulate this process, then you will need to navigate to the Body tab and under `x-www-form-urlencoded` enter key-values of `username: Fred` and `password: x` and issue a `POST` request to `http://localhost:3000/process_login`. Our server will then set the `username` cookie and Postman will have access to this and you can see it in the Cookies tab below where Body, Cookies, Headers, and Test Results tabs exist. 

The main thing `res.download` is going to do for you is to set the `Content-Disposition` header. Then it's going to call `res.sendFile` to actually send the file. So basically we set the `Content-Disposition` header and *then* we call `res.sendFile` with the file. The browser sees the `Content-Disposition` header as an `attachment` and then concludes, "Oh, I'm supposed to download this. I'm not supposed to render this." To recap, `res.download` is setting the appropriate headers for us so we can architect as good a user experience as possible! Specifically, it is setting the `Content-Disposition` header to `aatchment` with a `filename` of whatever the second argument is that we passed to `res.download` or the "actual" filename if we didn't pass the optional second argument. 

This is great! We could accomplish roughly the same behavior by doing the following instead:

```javascript
res.set('Content-Disposition', 'attachment');
res.sendFile
```

But why do it manually when `res.download` comes built-in and does it for us (because Express knows this is a commonly desired feature)? Express even has another response method for this kind of behavior: `res.attachment([filename])`. As [the docs](https://expressjs.com/en/4x/api.html#res.attachment) note: This (i.e., `res.attachment`) sets the HTTP response `Content-Disposition` header field to “attachment”. If a `filename` is given, then it sets the `Content-Type` based on the extension name via [res.type()](https://expressjs.com/en/4x/api.html#res.type), and sets the `Content-Disposition` “filename=” parameter:

```javascript
res.attachment()
// Content-Disposition: attachment

res.attachment('path/to/logo.png')
// Content-Disposition: attachment; filename="logo.png"
// Content-Type: image/png
```

All this to say: `res.download` is still probably the most intuitive and useful to use. Finally, one last thing to note about `res.download`: There is a third optional argument that can be used beyond just the filepath to the file desired to be downloaded (first arg) or what we want the filename to be called upon download (the second, optional arg). This third (optional) argument is a callback function that comes with an `error` object that is executed once everything is done:

```javascript
res.download(path.join(__dirname, 'userStatements/BankStatementAndChecking.png'), `${username}sStatement.png`, (error) => {
  console.log(error)
})
```

So above, if an error occurs, we'll know. Note again that the callback won't be run until the file transfer is complete. Something else to note here (and this really is the potentially sticky issue): If there is an error in sending the file, the headers may already be sent. That means you have already done your `res`. You don't get another `res.json()` or `res.send()` or something like that. We *cannot* do something like what you may be thinking:

```javascript
res.download(path.join(__dirname, 'userStatements/BankStatementAndChecking.png'), `${username}sStatement.png`, (error) => {
  res.redirect('/download/error')
})
```

The intenion above is clear: If there is an error in the attempt to download a file, then we want to redirect the user to a download error page. But we only get one `res` and if the headers have already been sent, then we simply cannot make this redirect. You'll get this error whenever you try to send the client more than one response (e.g., maybe you have `res.send('<h1>Hi!</h1>')` after a `res.json({message: 'hello'})`). So we're going to have to figure out another way to handle this. Now, a way to figure out if the headers have already been sent is to check a boolean that is made available to us by Express: `res.headersSent`. As [the docs](https://expressjs.com/en/4x/api.html#res.headersSent) note: This is a boolean property that indicates if the app sent HTTP headers for the response:

```javascript
app.get('/', function (req, res) {
  console.dir(res.headersSent) // false
  res.send('OK')
  console.dir(res.headersSent) // true
})
```

So we might do something like the following:

```javascript
res.download(path.join(__dirname, 'userStatements/BankStatementAndChecking.png'), `${username}sStatement.png`, (error) => {
  // If there is an error in sending the file, then HTTP headers may already be sent
  if(error) {
    // If headers have *not* been sent, then redirect to an error page.
    if(!res.headersSent) {
      res.redirect('/download/error')
    }
  }
})
```

So basically we will redirect the user if headers have *not* already been sent but will have to figure something else out if they have. So we'll only try to redirect them if the headers have not been sent. 

That covers the basics of how to download a file in about a single line. So remember: what `res.download` really does is set the single HTTP header `Content-Disposition` to `attachment` which the browser knows what to do. The browser makes a decision based on that. 

And that is really what you have to remember as your job as a developer: all you have to work with is one response. You send something back to the browser and Firefox, Chrome, Safari, etc., have all agreed what to do if the `Content-Disposition` header is set to `attachment`. That is what a protocol is. You're following the rules. They're (i.e., the browsers) are following the rules. We can't *force* the  browser to do anything. We can only set the headers and then let the browser take over.

---

</details>

<details><summary> <strong>The router: <code>express.Router([options])</code></strong></summary>

We are now going to take a look at `express.Router([options])`, the other main method we have not yet covered for the methods on the `express` object. The `router` object is almost like a microservices type architecture inside of your Express app--it essentially creates its own little mini application. Its only job is to handle middleware and to handle routes. That's all it does. It behaves like middleware but it's a really nice way to modularize your application. So the `app.get`, `app.post`, etc., that we have been using so far, the router works exactly the same way, but the router works in its own little container. You put it in its own folder to keep things straight. That is a really nice and important thing to do as a developer. Because as a developer when you start working through your application, you start trying to figure out where things are located, and you want to be able to know where the stuff is! That's why we create different directories and subdirectories and so forth. 

So right now consider what we had before as our little log in application:

```javascript
// Require native node modules
const path = require('path');

// Require third-party modules
const express = require('express');
const app = express(); // invoke an instance of an Express application
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Middleware used at the application level (i.e., on all routes/requests)
app.use(helmet());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Set default view engine and where views should be looked for by Express
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname + '/views')
]);

// Custom middleware run at the application level
app.use((req, res, next) => {
  if(req.query.msg === 'fail') {
    res.locals.msg = 'Sorry. This username and password combination does not exist.';
  } else {
    res.locals.msg = '';
  }
  next();
})

/////////////// JUST ROUTES BELOW (and where server is listening) ///////////////

app.get('/', (req, res, next) => {
  res.json({
    message: 'Sanity check good'
  });
})

app.get('/login', (req, res, next) => {
  res.render('login');
})

app.post('/process_login', (req, res, next) => {
  const { username, password } = req.body;
  if (password === 'x') {
    res.cookie('username', username);
    res.redirect(303, '/welcome');
  } else {
    res.redirect(303, '/login?msg=fail&test=hello');
  }
})

app.get('/welcome', (req, res, next) => {
  res.render('welcome', req.cookies);
})

app.param('generalStoryId', (req, res, next, generalStoryId) => {
  switch(true){
    case(generalStoryId > 0 && generalStoryId < 366):
      res.locals.storyType = 'daily';
      break
    case(generalStoryId < 1000000):
      res.locals.storyType = 'news';
      break
    case(generalStoryId < 1000000000):
      res.locals.storyType = 'blog';
      break
    default:
      res.locals.storyType = '';
      break
  }
  next();
})

app.get('/story/:generalStoryId', (req, res, next) => {
  const { generalStoryId } = req.params;
  const { storyType } = res.locals;
  res.locals.restOfStoryLink = Math.random();
  res.locals.generalStoryId = generalStoryId;
  switch(storyType){
    case('daily'):
      res.render('daily');
      break;
    case('news'):
      res.render('news');
      break;
    case('blog'):
      res.render('blog');
      break;
    default:
      res.send(`<h1>Woops! Looks like this story does not exist.</h1>`)
      break;
  }
})

app.get('/story/:generalStoryId/:link', (req, res, next) => {
  const {generalStoryId, link} = req.params;
  res.send(`<h1>This is the link: ${link}. You are now reading more about story ${generalStoryId}.</h1>`)
})

app.get('/statement', (req, res, next) => {
  const {username} = req.cookies;
  res.download(path.join(__dirname, 'userStatements/BankStatementAndChecking.png'), `${username}sStatement.png`)
})

app.get('/logout', (req, res, next) => {
  res.clearCookie('username')
  res.redirect(303, '/login');
})

app.listen(3000);
```

This is not that big *yet*. But as your application grows so will your code base. And if we look at the code above, then at the top we will see all of the middleware used at the application level (i.e., the middleware parsing the body, serving up static files, setting the views, etc.). Right now the routes really aren't so bad, but if you start adding stuff like database access, business logic, etc., then you will suddenly have a monolithic app. The point is that the router makes it very easy to modularize things. 

We are now going to create two new files, `routerApp.js` and `theRouter.js`. The way that our application is going to work is that `routerApp.js` will house our actual application (i.e., all of the middleware we use at the application level, what server we are listening on, etc.). And `theRouter.js` is going to be where the router lives (i.e., where we are going to handle all of our routes). This will make a lot more sense momentarily. 

The `routerApp.js` is easy to create and just like what we have been doing all along (except this time we will not include a view engine--we will response with JSON as if we are building an API).

```javascript
//routerApp.js

// Third-party modules
const express = require('express');
const app = express();
const helmet = require('helmet');

// Middleware used at the application level
app.use(helmet());
app.use(express.json())
app.use(express.urlencoded());
app.use(express.static('public'));

//////////////////////////////////////////////////
// NORMALLY WHERE THE ROUTES WOULD GO
// WE WANT TO MODULARIZE THIS NOW
// THIS LOGIC WILL GO IN theRouter.js
//////////////////////////////////////////////////

app.listen(3000);
```

That's it. Now let's talk about the construction *process* of `theRouter.js`. Since this will be a different file from `routerApp.js` and we want to use the `Router` method on the `express` object, we actually need `const express = require('express')` at the top of this file. Directly underneath we will create an instance of the `router` object:

```javascript
const express = require('express');
let router = express.Router();
```

As always, check [the docs](https://expressjs.com/en/4x/api.html#express.router) for more about `express.Router([options])`. It's fairly simple: you create a new [router](https://expressjs.com/en/4x/api.html#router) object as we did above: `let router = express.Router();`. Typically, you will probably not want to use the optional `options` parameter (all of the options make things more strict), but it's good to know about them because they specify how the router is to behave (note that `mergeParams` is only available with version `4.5.0+` of Express):

| Property | Description | Default |
| :-: | :-- | :-- |
| `caseSensitive` | Enable case sensitivity. | Disabled by default, treating “/Foo” and “/foo” as the same. |
| `mergeParams` | Preserve the `req.params` values from the parent router. If the parent and the child have conflicting param names, the child’s value take precedence. | `false` |
| `strict` | Enable strict routing. | Disabled by default, “/foo” and “/foo/” are treated the same by the router. |

As the docs note under this table, you can add middleware and HTTP method routes (such as `get`, `put`, `post`, and so on) to `router` just like an application.

The `router` works the same that the `app` router does. It's just that it's specific to *this* router. The docs have some beginning notes on [the Router object](https://expressjs.com/en/4x/api.html#router) that are worth reproducing below (the docs then simply explore all the methods on the `router` object which we will be exploring ourselves).

---
**From the docs:** A `router` object is an isolated instance of middleware and routes. You can think of it as a “mini-application,” capable only of performing middleware and routing functions. Every Express application has a built-in app router.

A router behaves like middleware itself, so you can use it as an argument to [app.use()](https://expressjs.com/en/4x/api.html#app.use) or as the argument to another router’s [use()](https://expressjs.com/en/4x/api.html#router.use) method. 

The top-level `express` object has a [Router()](https://expressjs.com/en/4x/api.html#express.router) method that creates a new `router` object.

Once you’ve created a router object, you can add middleware and HTTP method routes (such as `get`, `put`, `post`, and so on) to it just like an application. For example:

```javascript
// invoked for any requests passed to this router
router.use(function (req, res, next) {
  // .. some logic here .. like any other middleware
  next()
})

// will handle any request that ends in /events
// depends on where the router is "use()'d"
router.get('/events', function (req, res, next) {
  // ..
})
```

You can then use a router for a particular root URL in this way separating your routes into files or even mini-apps.

```javascript
// only requests to /calendar/* will be sent to our "router"
app.use('/calendar', router)
```

---

So instead of using `app.get(...)` as we have done previously, we will now do `router.get(...)`. These two things will do exactly the same thing. The difference is that the `router` in `router.get(...)` is made specifically for this purpose, whereas `app` can do anything and it's done at the application level (hence, `app(lication).get` ). The `router` gives us a little bit more of an option in terms of modularizing the application and creating a nicer long-term architecture. So this is how we will do things from now on and you should too.

So right now we will start with a simple

```javascript
router.get('/', (req, res, next) => {
  res.json({
    msg: 'Router works!'
  })
})
```

where we still have access to the `req`, `res`, and `next` objects just as we did before when using `app`. Why? Recall from the docs: A router behaves like middleware itself, so you can use it as an argument to `app.use()` or as the argument to another router's `use()` method. We have not brought this router into `routerApp.js` yet, but the point is we can put something like `app.use('/', router)`, and this will inform Express that we want to use this router whenever a user makes a request to the root page of our application (note that this will invoke the usage of the router for *any* type of request to `/` because we are utilizing `app.use` instead of `app.get` or something like that). 

So how can we actually use the router in our application? Since `theRouter.js` is a *file*, in order for our application to use or consume it, we are going to need to export it. So we need to drop a little `module.exports = router` which comes straight from Node.js (not an Express-centric thing). This will send back the router to whomever is asking for it via `module.exports`. 

So right now `theRouter.js` would look something like this:

```javascript
const express = require('express');
let router = express.Router();

router.get('/', (req, res, next) => {
  res.json({
    msg: 'Router works!'
  })
})

module.exports = router;
```

And now we can *use* the router in our application like so:

```javascript
// Third-party modules
const express = require('express');
const app = express();
const helmet = require('helmet');

// Middleware used at the application level
app.use(helmet());
app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

//////////////////////////////////////////////////
// NORMALLY WHERE THE ROUTES WOULD GO
// WE WANT TO MODULARIZE THIS NOW
// THIS LOGIC WILL GO IN theRouter.js
//////////////////////////////////////////////////

// Routes we want to use at different levels of the application
const router = require('./theRouter');

// Enlisting the routes brought in to actually use in the application
app.use('/', router);

app.listen(3000);
```

So to make use of the router:

1. Import it into the main application: `const router = require('./theRouter')`
2. Use it in the application where you see fit: `app.use('/', router)`

In truth, we would probably want to import the router for `/` not as `router` but as something more descriptive like `indexRouter`. Similarly, if we want a whole series of middleware and routing to apply whenever a user hits the `/story` route, then we would probably want to have a `storyRouting.js` file (similar to our `theRouter.js` file) that we `require`ed from our application and used like so:

```javascript
const storyRouter = require('storyRouting');
app.use('/story', storyRouter);
```

| Note about `module.exports` and importing files |
| :--- |
| If we export *only* the `router` from a file with routing logic like `module.exports = router`, then by default the `router` being exported is considered a default export and we can simply import it, name it whatever we want, and use it by referring to what we have named it. For example, previously we had `const router = require('theRouter')`. We *do not*, and almost always *will not*, refer to the `router` being exported simply as `router`. Usually we will name it so it reflects what kind of routing logic it is supposed to contain. Since the `router` object is often the only thing being exported from a routing file (and hence considered the `default export`), we can name the incoming `router` object whatever we please. That is: `const whatever-name-you-want = require('routerFile')` will work. However, if, for some reason, *more than one* thing is being exported from the routing file, then you will need to be more cautious.<br><br>For example, suppose, for some crazy reason, that our routing file for `/story` had the following at the end of it: `module.exports = { router, bestSport: 'Basketball' };`. Then our application file would need to bring the `router` object in like so: `const { router: storyRouter } = require('storyRouting')`. We are simply using ES6 to destructure and rename since `router` is no longer the default export from `storyRouter.js`. See [this article](https://wesbos.com/destructuring-renaming/) for more about destructuring and renaming. This is not an Express thing, but it's helpful to know. |

So real quick let's review what's happening in our basic `theRouter.js` file:

```javascript
const express = require('express');
let router = express.Router();

router.get('/', (req, res, next) => {
  res.json({
    msg: 'Router works!'
  })
})

module.exports = router;
```

1. We want to use Express (the `Router` method in particular) so we import the [express](https://www.npmjs.com/package/express) package and name its default export `express`. 
2. We call the `Router` method on the `express` object and assign the return value to `router`.
3. We create a whole bunch of middleware and routes in our routing file (right now just one route). The middleware can be standalone (i.e., named or anonymous functions that manipulate `req` and `res` in some way) or used in the routing (i.e., as an anonymous callback function as is being done above). The point, however, is that all the methods we might normally use at the application level with `app.METHOD` are now being used in a more modular, containerized fashion with `router.METHOD`, where the `router` is only going to be applied in the application where we designate with `app.use('/where-to-use-router')`, and this `router` will be used for all requests to `/where-to-use-router` since we utilized `app.use` instead of `app.get` or something else more restrictive. 
4. We export the `router`. But notice what all has been *added* to the `router`. Did we make any modifications to the `router` object? Of course we did! That is the whole point. We dumped a bunch of logic into the different methods for `router` to actually make use of in our application: `router.get(...logic...)`, `router.post(...logic...)`, etc. If it helps, think of this like adding properties or methods to "normaly" objects in JavaScript. For example, we can declare a normal object like so: `let myDog = { name: 'Bowser' }`. Now let's define a method for `myDog`: `myDog.getName = function() {return this.name};`. Finally, let's actually call this method: `myDog.getName() // Bowser`. Think of this whole process with `router` like what we just did with `myDog`. You attach a bunch of logic to the built-in `get`, `post`, etc., methods on `router` and then this logic fires off once those kinds of requests are made. When we export the `router` object, we export all of the logic we defined for its different methods too. 

<details><summary> <strong>What the exported <code>router</code> object looks like based on methods and middleware you use</strong></summary>

To make the note immediately above more concrete (i.e., that whatever route handling we do with `route.METHOD` or whatever middleware we define and *use* within these routes is basically like tacking on methods for ordinary JavaScript objects), we will take a look under the hood and see what `router` looks like after using `router.METHOD` and associated middleware. First take a look at the beginning of the [the docs](https://expressjs.com/en/4x/api.html#router) about the `router` object: A `router` object is an isolated instance of middleware and routes. You can think of it as a “mini-application,” capable only of performing middleware and routing functions. Every Express application has a built-in app router.

That said, consider the following two files we will use to illustrate what is going on under the hood:

```javascript
// routerApp.js // this is the main application

// Third-party modules
const express = require('express');
const app = express();
const helmet = require('helmet');

// Middleware used at the application level
app.use(helmet());
app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

//////////////////////////////////////////////////
// NORMALLY WHERE THE ROUTES WOULD GO
// WE WANT TO MODULARIZE THIS NOW
// THIS LOGIC WILL GO IN theRouter.js
//////////////////////////////////////////////////

// Routes we want to use at different levels of the application
const router = require('./theRouter');
console.log('This is the imported router: ', router);

// Enlisting the routes brought in to actually use in the application
app.use('/', router)

app.listen(3000);
```

And then one of the routes we will export as `router`:

```javascript
// theRouter.js // our router and the router to be imported into the main application

const express = require('express');
let router = express.Router();

function validateUser(req, res, next) {
  res.locals.validated = true;
  next();
}

// router.use(validateUser);

router.get('/', (req, res, next) => {
  res.json({
    msg: 'Router works!'
  })
})

router.post('/', (req, res, next) => {
  res.json({
    msg: 'Router works!'
  })
})

module.exports = router
```

We'll get to why `router.use(validateUser)` is commented out momentarily, but let's first see what `router` looks like when we log it to the console after firing up the app:

```
This is the imported router:  [Function: router] {
  params: {},
  _params: [],
  caseSensitive: undefined,
  mergeParams: undefined,
  strict: undefined,
  stack: [
    Layer {
      handle: [Function: bound dispatch],
      name: 'bound dispatch',
      params: undefined,
      path: undefined,
      keys: [],
      regexp: /^\/?$/i,
      route: [Route]
    },
    Layer {
      handle: [Function: bound dispatch],
      name: 'bound dispatch',
      params: undefined,
      path: undefined,
      keys: [],
      regexp: /^\/?$/i,
      route: [Route]
    }
  ]
}
```

It looks like there's a `stack` property on the `router` object whose value is an array of middleware functions or `Layer`s *used* within the router just imported. Specifically, each `Layer` appears to refer to the middleware we are using for the different `METHODS` on the `router` object. That is, the first `Layer` appears to point to `router.get(...)` and the second layer appears to point to `router.post(...)`. What about the `validateUser` middleware in the `router`? Well, unless we *use* it in the `router`, then it will not get pushed onto the `stack`. So if we now uncomment `router.use(validateUser);`, then we will see something like the following:

```
This is the imported router:  [Function: router] {
  params: {},
  _params: [],
  caseSensitive: undefined,
  mergeParams: undefined,
  strict: undefined,
  stack: [
    Layer {
      handle: [Function: validateUser],
      name: 'validateUser',
      params: undefined,
      path: undefined,
      keys: [],
      regexp: /^\/?(?=\/|$)/i,
      route: undefined
    },
    Layer {
      handle: [Function: bound dispatch],
      name: 'bound dispatch',
      params: undefined,
      path: undefined,
      keys: [],
      regexp: /^\/?$/i,
      route: [Route]
    },
    Layer {
      handle: [Function: bound dispatch],
      name: 'bound dispatch',
      params: undefined,
      path: undefined,
      keys: [],
      regexp: /^\/?$/i,
      route: [Route]
    }
  ]
}
```

Because the middleware was actually used, this got pushed onto the `stack` of our `router` object. If you're really in the mood, you can investigate this behavior further by digging into the express node module:

```
node_modules -> express -> lib -> router -> index.js
```

If you look around in `index.js` you will come across `proto.use = function use(fn) { ... }` and inside of the function body you will see `this.stack.push(layer);`. If you are feeling adventurous, then you can even put `console.log('MIDDLEWARE FUNCTIONS BEING USED: ', this)` right before the final line of the function (i.e., `return this`) to see what `this` refers to. When `app.use(validateUser);` is *not* commented, then the `validateUser` function will show up in the `stack` (along with a bunch of other middleware being used that we don't explicitly interact with like `query`, `expressInit`, `helmet`, `jsonParser`, `urlencodedParser`, `serveStatic`, etc.) 

And really this should make sense given the structure of our very basic application thus far:

```javascript
// Third-party modules
const express = require('express');
const app = express();
const helmet = require('helmet');

// Middleware used at the application level
app.use(helmet());
app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

const router = require('./theRouter');

app.use('/', router)

app.listen(3000);
```

Given the above, is it any surprise to find `expressInit`, `helmet`, `jsonParser`, etc.? Simply recall what `res.json` does. It parses JSON for us and it is based on the `body-parser` node module. If we do a quick search we can even see the `jsonParser` function being exported:

```
node_modules -> body-parser -> lib -> types -> json.js
```

You will see in this file `module.exports = json`. Well what is `json`? It's a function that *returns* `jsonParser`, where `jsonParser` is middleware because it has access to `req`, `res`, and `next`, made evident in the signature of the function. 

The point of *all* of this is simply to emphasize that within whatever routing file you create, the `router` object you define and subsequently apply middleware to (whether it's middleware anonymous callback functions within `METHODS` on `router` such as `get`, `post`, etc.) is going to be part of the `router` object you export. Basically, the routing file you create is just a way of building the `router` object for a certain route which you then export to the main application and *use* at the application level on the designated/desired route. 

---

</details>

By including `app.use('/', router);` in our main application, let's consider what we are effectively communicating to Express. The `'/', router` in `app.use('/', router);` is regular ole middleware. It means, "Hey, `app`! At the `/` path, I want you to use this thing: `router`." That means that everything in the file from which `router` came is going to be used at the `/` route. 

This next point is incredibly important and basically how all of the routing is structured/configured: All of the paths in the routing file are relative to the path specified in `app.use`. That is, if we have a file `storyRouting.js` that exports a router we call `storyRouter` in the main application, where subsequently we declare `app.use('/story', storyRouter);` in the main application, then this means that *all* of the routes in `storyRouting.js` are relative to `/story` since that was the path specified in `app.use('/story', storyRouter);`.

Essentially, this is like prepending `/story` to *every* route in `storyRouting.js`. The `storyRouting.js` file is only meant to handle requests (of any kind) to `/story`. To put it more clearly, suppose we had the following routes in our main application (much as we used to do by including *all* of the routing in our main application regardless of the path):

```javascript
app.get('/story/topic', ...);
app.post('/story/topic', ...);
app.get('/story/author/:authorId', ...);
app.post('/story/title/:authorId');
// ...
app.get('/television/show/:showId', ...);
app.get('/television/review/:reviewId', ...);
app.delete('/television/show/:showId', ...);
app.put('/television/review/edit/:reviewerId', ...);
// ...
```

Notice a pattern? We're handling a lot of traffic to `/story` as well as to `/television`. You can imagine a bunch of other traffic for different routes depending on the application. We can clean up the code above by creating routers to handle the `/story` and `/television` routes separately. In our main application, we would first probably build a `routes` folder to house all of our routes and then include  something like the following:

```javascript
// import routers 
const storyRouter = require('./routes/storyRouting'); // import router from storyRouting.js
const televisionRouter = require('./routes/televisionRouting'); // import router from televisionRouting.js

// use routers in main application
app.use('/story', storyRouter);
app.use('/television', televisionRouter);
```

Then our `storyRouting.js` file would look something like this:

```javascript
// storyRouting.js
const express = require('express');
let router = express.Router();

router.get('/topic', ...);
router.post('/topic', ...);
router.get('/author/:id', ...);
router.post('/title/:authorId');
// ...
module.exports = router     // <-- imported as storyRouter in main application
```

And our `televisionRouting.js` file would look something like this: 

```javascript
// televisionRouting.js
const express = require('express');
let router = express.Router();

router.get('/show/:showId', ...);
router.get('/review/:reviewId', ...);
router.delete('/show/:showId', ...);
router.put('/review/edit/:reviewerId', ...);
// ...
module.exports = router     // <-- imported as televisionRouter in main application
```

The idea is that we can have lots of routers that only trigger based on requests to certain paths. All of this may seem somewhat abstract at first, but it's nothing we haven't seen before. `app.use` in general simply means, "Hey, we're about to add some middleware to our application." In the case of something like `app.use('/story', storyRouter);`, it still means the same thing: "Hey, I want to add a bunch of middleware to my application for any kind of request to the `/story` route and I want the middleware defined in `storyRouter` to apply to such requests." 

One thing to note, which you saw if you looked at the note about what the exported `router` actually likes like from a file that is exporting a router to use in the application, is what `router.use` is all about. Just like `app.use` means, "Hey, I want to apply some middleware to this application for any kind of request.," we have `router.use` which similarly means, "Hey, I want to apply some middleware to THIS ROUTER for any kind of request (i.e., the middleware will be applied to any request that hits the path for which our router is handling traffic)." So again this makes sense in light of thinking of routers as almost defining their own little mini applications. 

This is very nice because it keeps our middleware as well as our routes separate from the main application. The router is almost a way to create a bunch of tiny little applications inside of your main app sort of like a microservices kind of architecture. The router will allow you to keep your main application very clean. You will have in the main application things that need to be done everywhere. 

---

</details>



## Course Questions to Follow Up On

- TBD

