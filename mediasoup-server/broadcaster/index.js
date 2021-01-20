var html = require('choo/html')
var devtools = require('choo-devtools')
var choo = require('choo')
const createBroadcaster = require('./mediasoup-broadcaster.js')
const selectMedia = require('./select-media.js')
const { nanoid } = require('nanoid')
const insertCss = require('insert-css')

insertCss(`
  .bg-custom-purple {
    background: #be86ff;
  }

  .bg-custom-green {
    background: #6cebbd;
  }
  `)

var app = choo()
app.use(devtools())
app.use(mediaStore)
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  const viewerURL =  `${window.location.origin}/viewer/?stream=${state.broadcast.streamKey}`
  return html`
    <body class="w-100 h-100 mw-100 avenir ${state.broadcast.isLive?'bg-custom-green black' : 'bg-custom-purple black'}">
      <div class="pa4 pb0 flex">
        <button class="ma2 ml0 mr4 ph4 mw5 f4 bg-black light-green ba dim pointer" onclick=${() => emit('toggle broadcast')}> ${state.broadcast.isLive? 'Stop broadcast' : 'Go live!'} </button>
        <div class="f2 ma2">
          <div>${state.broadcaster.peers.length} viewer(s) connected </div>
          <div  class="f3"><a target="_blank" class="dim black" href=${viewerURL}>${viewerURL}</a></div>

        </div>
      </div>
      <div class="flex w-100">
        <div class="pa0 f6 flex-auto">
          ${selectMedia(state, emit)}
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


  state.broadcast = {
    streamKey:  streamKey == null ? nanoid() : streamKey,
    isLive: false
  }

  urlParams.set('stream', state.broadcast.streamKey);
  window.history.replaceState(null,'', `?stream=${state.broadcast.streamKey}`);
  //window.location.search = urlParams;

  state.selectMedia = {
      video: null,
      audio: null
    }



  const serverURL = `wss://${window.location.host}`

  // ?stream=${state.broadcastTracks.streamKey}`


  console.log(' connecting to ', serverURL)
  state.broadcaster = createBroadcaster({
    server: serverURL,
    onUpdate: updateBroadcast,
    streamKey: state.broadcast.streamKey
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
    state.broadcast.isLive =! state.broadcast.isLive
    if(!state.broadcast.isLive) {
      state.broadcaster.updateBroadcast({ audio: null, video: null})
    } else {
      state.broadcaster.updateBroadcast(state.selectMedia)
    }
    emitter.emit('render')
  })

  emitter.on('selectMedia:updateTrack', (kind, value) => {
    state.selectMedia[kind] = value
    if(state.broadcast.isLive) {
      state.broadcaster.updateBroadcast(state.selectMedia)
    }
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
