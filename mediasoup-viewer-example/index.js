window.onload = () => {
  const createViewer = require('./viewer/mediasoup-viewer.js')
  let hasStarted = false
  document.body.innerHTML = 'this an example viewer for the media soup broadcaster. click to start!'

  //const server = `wss://livelab.app:3499`
  // const server = `wss://192.168.178.37:8000`
  //const server = `wss://localhost:8000/${window.location.search}`

  //const server = `wss://${window.location.hostname}:8000/${window.location.search}`

  const server = `wss://${window.location.hostname}:8000/${window.location.search}`
  //window.onclick = () => {
    if(!hasStarted) {
        // create a video element and add it to the page
      const video = document.createElement('video')
      video.className ="w-100 h-100"
      video.autoplay = true
      video.muted = true
      video.controls = true
      document.body.innerHTML = ''
      document.body.appendChild(video)

      // turn the video element into a viewer for server location `wss://localhost:8000`
      const viewer = createViewer({ videoEl: video, server:  server})
      hasStarted = true
    }
  //}
}
