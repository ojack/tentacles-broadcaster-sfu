var html = require('choo/html')
var devtools = require('choo-devtools')
var choo = require('choo')
const createBroadcaster = require('./mediasoup-broadcaster.js')
const MediaPreview = require('./mediaPreview.js')

var app = choo()
app.use(devtools())
app.use(mediaStore)
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  return html`
    <body class="w-100 h-100 mw-100 bg-dark-gray near-white">
      <div class="pa2">
        <button onclick=${() => emit('toggle broadcast')}> Go live! </button>
        <div > ${state.broadcaster.peers.length} connected </div>
      </div>
      <div class="flex w-100">
        <div class="pa2 ba flex-auto">
          media preview
          ${state.cache(MediaPreview, 'media-preview').render()}
        </div>
        <div class="pa2 ba flex-auto">
          media broadcast
        </div>
      </div>
    </body>
  `

  function onclick () {
    emit('increment', 1)
  }
}

function mediaStore (state, emitter) {
  // state.previewTracks = {
  //   video: null,
  //   audio: null
  // }
  state.broadcastTracks = {
    video: null,
    audio: null
  }

  state.isBroadcasting = false
  state.broadcaster = createBroadcaster({
    server: `wss://localhost:8000`,
    onUpdate: updateBroadcast
  })

  emitter.on('toggle broadcast', function () {
    // console.log('TOGLLE', state.preview.streams)
    // if(!state.isBroadcasting) {
    //  if(state.preview.tracks.video !== null) {
      //  state.broadcaster.updateBroadcast(state.preview.tracks)
          state.broadcaster.broadcastVideo(state.preview.tracks.video)
    //  }
    // }
    // state.isBroadcasting =! state.isBroadcasting
  })

  function updateBroadcast() {
    console.log(state.broadcaster)
    emitter.emit('render')
  }
  // emitter.on('increment', function (count) {
  //   state.count += count
  //   emitter.emit('render')
  // })
}
