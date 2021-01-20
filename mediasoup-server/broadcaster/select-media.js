const html = require('choo/html')
const AudioSelect = require('./components/audioSelect.js')
const VideoSelect = require('./components/videoSelect.js')


module.exports = (state, emit) => {
  return html`<div>
    ${state.cache(VideoSelect, 'select-video').render({onChange: (track) => emit('selectMedia:updateTrack', 'video', track)})}
    ${state.cache(AudioSelect, 'select-audio').render({onChange: (track) => emit('selectMedia:updateTrack', 'audio', track)})}
  </div>`
}
