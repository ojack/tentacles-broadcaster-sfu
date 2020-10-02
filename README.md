# mediasoup server for vitalsigns

Minimal simple broadcaster created using mediasoup `v3`.

## Example viewer can be found in 'mediasoup-viewer'

```sh
cd mediasoup-viewer-example

npm i
npm start
```

Example code is in 'index.js'. This viewer connects to a socket server hosted at `wss://localhost:8000`.
(Change this address to connect to a different server.)

## Setup server and broadcaster

```sh
cd mediasoup-server

npm i
npm start
```

Websocket server and broadcaster run on `https://localhost:8000`. Change main.js to update port and ssl certificate location.

Media server uses ports 3000-4000.
