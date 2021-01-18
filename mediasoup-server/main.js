const http = require("http");
var https = require('https')
var express = require('express')
var app = express()
var fs = require('fs');
const { WebSocketServer } = require("protoo-server");
const mediasoup = require("mediasoup");
const ConfRoom = require("./lib/Room");
const config = require('./config.js');

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

  const room = new ConfRoom(router);

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

    room.handlePeerConnect({
      // to be more and more strict
      peerId: `p${String(Math.random()).slice(2)}`,
      protooWebSocketTransport: accept()
    });
  });

//  console.log("websocket server started on http://127.0.0.1:2345");
  setInterval(() => console.log("room stat", room.getStatus()), 1000 * 5);
})();
