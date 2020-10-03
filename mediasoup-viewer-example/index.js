const createViewer = require('./viewer/mediasoup-viewer.js')
let hasStarted = false
document.body.innerHTML = 'this an example viewer for the media soup broadcaster. click to start!'

window.onclick = () => {
  if(!hasStarted) {
      // create a video element and add it to the page
    const video = document.createElement('video')
    video.autoplay = true
    // video.controls = true
    document.body.innerHTML = ''
    document.body.appendChild(video)

    // turn the video element into a viewer for server location `wss://localhost:8000`
    const viewer = createViewer({ videoEl: video, server: `wss://localhost:8000` })
    hasStarted = true
  }
}
