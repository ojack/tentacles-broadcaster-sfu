var html = require('choo/html')
var devtools = require('choo-devtools')
var choo = require('choo')
const createBroadcaster = require('./mediasoup-broadcaster.js')
const MediaPreview = require('./mediaPreview.js')
const selectMedia = require('./select-media.js')

var app = choo()
app.use(devtools())
app.use(mediaStore)
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  const viewerURL =  `${window.location.origin}/viewer/?stream=${state.broadcastTracks.streamKey}`
  return html`
    <body class="w-100 h-100 mw-100 avenir white ${state.isBroadcasting?'bg-dark-green':'bg-dark-gray'}">
      <div class="pa2 flex">
        <button class="ma2 pointer" onclick=${() => emit('toggle broadcast')}> ${state.isBroadcasting? 'Stop broadcast' : 'Go live!'} </button>
        <div class="f2 ma2"> ${state.broadcaster.peers.length} viewer(s) connected </div>
      </div>
      <div  class="white pl2 f6"><a target="_blank" class="dim white" href=${viewerURL}>${viewerURL}</a></div>
      <div class="flex w-100 pa2">
        <div class="pa4 pt0 ba f6 flex-auto">

          ${selectMedia(state, emit)}
          ${state.cache(MediaPreview, 'media-preview').render()}
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
  const urlParams = new URLSearchParams(window.location.search);
  const streamKey = urlParams.get('stream')

  state.broadcastTracks = {
    video: null,
    audio: null,
    streamKey: streamKey === "null" ? 'test' : streamKey
  }

  state.isBroadcasting = false



  const serverURL = `wss://${window.location.host}`

  // ?stream=${state.broadcastTracks.streamKey}`


  console.log(' connecting to ', serverURL)
  state.broadcaster = createBroadcaster({
    server: serverURL,
    onUpdate: updateBroadcast,
    streamKey: state.broadcastTracks.streamKey
  })

  emitter.on('toggle broadcast', function () {
    // console.log('TOGLLE', state.preview.streams)
    // if(!state.isBroadcasting) {
    //  if(state.preview.tracks.video !== null) {
      //  state.broadcaster.updateBroadcast(state.preview.tracks)
    // state.broadcaster.updateBroadcast(state.preview.tracks)
        //  state.broadcaster.broadcastVideo(state.preview.tracks.video)
    //  }
    // }
    state.isBroadcasting =! state.isBroadcasting
    if(!state.isBroadcasting) {
      state.broadcaster.updateBroadcast({ audio: null, video: null})
    } else {
      state.broadcaster.updateBroadcast(state.preview.tracks)
    }
    emitter.emit('render')
  })

  emitter.on('updateMedia', () => {
    if(state.isBroadcasting) {
      state.broadcaster.updateBroadcast(state.preview.tracks)
    }
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
