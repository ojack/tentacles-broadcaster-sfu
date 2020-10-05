const createViewer = require('./viewer/mediasoup-viewer.js')
let hasStarted = false
document.body.innerHTML = 'this an example viewer for the media soup broadcaster. click to start!'

//const server = `wss://livelab.app:3499`
const server = `wss://192.168.178.37:8000`

window.onclick = () => {
  if(!hasStarted) {
      // create a video element and add it to the page
    const video = document.createElement('video')
    video.autoplay = true
    // video.controls = true
    document.body.innerHTML = ''
    document.body.appendChild(video)

    // turn the video element into a viewer for server location `wss://localhost:8000`
    const viewer = createViewer({ videoEl: video, server:  server})
    hasStarted = true
  }
}
