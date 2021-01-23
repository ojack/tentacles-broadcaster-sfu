var choo = require('choo')
const createGrid = require('./viewer/videogrid.js')
const Viewer = require('./viewer/mediasoup-viewer.js')
const html = require('choo/html')

const keys = ['hacklab-0', 'hacklab-1', 'hacklab-2']
const server = `wss://mediasoup.tentacles.live:8000`

const app = choo()
app.use(mediaStore)
app.route('/', mainView)
app.mount('body')

function mediaStore (state, emitter) {
  const viewers = keys.map((key) => {
    const vid = html`<video class="w-100 h-100" autoplay muted controls></video>`
    const viewer = new Viewer({ videoEl: vid, server: server, streamKey: key })
    viewer.on('update', (tracks) => {
    //  console.log('update!!')
      emitter.emit('render')
    })
    return {
      vidEl: vid,
      viewer: viewer
    }
  })

  window.addEventListener('resize', () => emitter.emit('render'))
  state.viewers = viewers
}

function mainView(state, emit) {
  return html`<body>
    ${createGrid({ elements: state.viewers.filter(({ viewer }) => {
      console.log(viewer)
      return viewer.isActive
    }).map((obj) => obj.vidEl) })}
  </body>`
}

// window.onload = () => {
//
//
//   const grid = createGrid({
//     elements: viewers
//   })
//   document.body.appendChild(grid)
//
//   // let hasStarted = false
//   // document.body.innerHTML = 'this an example viewer for the media soup broadcaster. click to start!'
//   //
//   // //const server = `wss://livelab.app:3499`
//   // // const server = `wss://192.168.178.37:8000`
//   // //const server = `wss://localhost:8000/${window.location.search}`
//   //
//   // //const server = `wss://${window.location.hostname}:8000/${window.location.search}`
//   //
//   //
//   // // const server2 = `wss://mediasoup.tentacles.live:8000/?stream=test1`
//   // //window.onclick = () => {
//   //   if(!hasStarted) {
//   //       // create a video element and add it to the page
//   //
//   //     document.body.innerHTML = ''
//   //     const vid1 = createVideo()
//   //     const vid2 = createVideo()
//   //     // document.body.appendChild(vid1)
//   //     // document.body.appendChild(vid2)
//   //
//   //
//   //     // turn the video element into a viewer for server location `wss://localhost:8000`
//   //     const viewer0 = createViewer({ videoEl: vid1, server:  server, streamKey: "hacklab-0", onUpdate: (tracks) => {
//   //       console.log('tracks update', tracks)
//   //     }})
//   //     const viewer1 = createViewer({ videoEl: vid2, server:  server, streamKey: "hacklab-1"})
//   //
//   //     const grid = createGrid({
//   //       elements: [vid1, vid2]
//   //     })
//   //     document.body.appendChild(grid)
//   //     hasStarted = true
//   //   }
//   //}
// }
//
// const createVideo = () => {
//   const video = document.createElement('video')
//   video.className ="w-100 h-50"
//   video.autoplay = true
//   video.muted = true
//   video.controls = true
//   return video
// }
