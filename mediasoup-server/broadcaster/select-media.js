const html = require('choo/html')
const AudioSelect = require('./components/audioSelect.js')
const VideoSelect = require('./components/videoSelect.js')


module.exports = (state, emit) => {
  return html`<div class="flex flex-column flex-row-l">
      <div class="pa4 mw6 w-100">
        ${state.cache(VideoSelect, 'select-video').render({onChange: (track) => emit('selectMedia:updateTrack', 'video', track)})}
      </div>
      <div class="pa4 mw6 w-100">
        ${state.cache(AudioSelect, 'select-audio').render({onChange: (track) => emit('selectMedia:updateTrack', 'audio', track)})}
      </div>
  </div>`
}
