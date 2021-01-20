module.exports = {
  port: 8000, // port where socket server and broadcaster will be hosted
  sslKey: '/etc/letsencrypt/live/mediasoup.tentacles.live/privkey.pem',
  sslCert: '/etc/letsencrypt/live/mediasoup.tentacles.live/fullchain.pem',
  worker: {
    rtcMinPort: 3000,
    rtcMaxPort: 4000
  },
  webRtcTransport: {
    listenIps: [
      {
        // ip: '127.0.0.1', // set to public IP
        // ip: "192.168.178.37" // vitalsigns
        ip: "167.172.103.26" // tentacles / mediasoup
      }
    ]
  },
  router: {
    mediaCodecs:  [
      {
        kind: "audio",
        name: "opus",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2
      },
      {
  			kind         : 'video',
  			mimeType     : 'video/VP9',
  			clockRate    : 90000,
  			// rtcpFeedback :
  			// [
  			// 	{ type: 'nack' },
  			// 	{ type: 'nack', parameter: 'pli' },
  			// 	{ type: 'ccm', parameter: 'fir' },
  			// 	{ type: 'goog-remb' },
  			// 	{ type: 'transport-cc' }
  			// ]
  		},
      {
        kind: "video",
        name: "VP8",
        mimeType: "video/VP8",
        clockRate: 90000
      },
      {
			kind       : 'video',
			mimeType   : 'video/H264',
			clockRate  : 90000,
			parameters :
  			{
  				'packetization-mode'      : 1,
  				'level-asymmetry-allowed' : 1
  			}
      }
    ]
  }
}
