const http = require("http");
var https = require('https')
var express = require('express')
var app = express()
var fs = require('fs');
const { WebSocketServer } = require("protoo-server");
const mediasoup = require("mediasoup");
const ConfRoom = require("./lib/Room");
const config = process.env.NODE_ENV === 'production' ? require('./config.tentacles.js') : require('./config.js');
const QuickLRU = require('quick-lru');



//const lru = new QuickLRU({maxSize: 1000});

(async () => {
  var privateKey  = fs.readFileSync(config.sslKey, 'utf8')
  var certificate = fs.readFileSync(config.sslCert, 'utf8')
  var portNumber = config.port

  var credentials = {
    key: privateKey,
    cert: certificate
  }

  const worker = await mediasoup.createWorker(config.worker);

  worker.on("died", () => {
    console.log("mediasoup Worker died, exit..");
    process.exit(1);
  });

  const router = await worker.createRouter(config.router);

  let roomList = new QuickLRU({ maxSize: 1000 })
  //const room = new ConfRoom(router);

  // const httpServer = http.createServer();
  // await new Promise(resolve => {
  //   httpServer.listen(2345, "127.0.0.1", resolve);
  // });

  var httpsServer = https.createServer(credentials, app)
  httpsServer.listen(portNumber, function(){
    console.log("server available at port "+portNumber)
  })

  app.use(express.static(__dirname +'/broadcaster/public'))


  const wsServer = new WebSocketServer(httpsServer);
  wsServer.on("connectionrequest", (info, accept) => {
    console.log(
      "protoo connection request [peerId:%s, address:%s, origin:%s]",
      info.socket.remoteAddress,
      info.origin
    );

        // Parse WSS Query Paraemters
     var queryString = info.request.url || '';
     if(queryString.substr(0,1) === '/') { queryString = queryString.substr(1, queryString.length); }
     const urlParams = new URLSearchParams(queryString);
     const streamId = urlParams.get('stream') || 'test';
     const peerId = urlParams.get('id') ||  `p${String(Math.random()).slice(2)}`;

     // streamId is equivalent to roomId
     if (roomList.has(streamId)) {
     var room = roomList.get(streamId);
     room.handlePeerConnect({
       peerId: peerId,
       protooWebSocketTransport: accept()
     });
           console.log("existing room stat", streamId, peerId, room.getStatus() );
   } else {
     var room = new ConfRoom(router, config);
     roomList.set(streamId,room);
     room.handlePeerConnect({
       peerId: peerId,
       protooWebSocketTransport: accept()
     });
           console.log("new stream stat", streamId, peerId, room.getStatus() );
   }
    //
    // room.handlePeerConnect({
    //   // to be more and more strict
    //   peerId: `p${String(Math.random()).slice(2)}`,
    //   protooWebSocketTransport: accept()
    // });
  });

//  console.log("websocket server started on http://127.0.0.1:2345");
//  setInterval(() => console.log("room stat", room.getStatus()), 1000 * 5);
})();
