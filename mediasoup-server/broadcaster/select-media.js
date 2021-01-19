const html = require('choo/html')
const AudioSelect = require('./components/audioSelect.js')

module.exports = (state, emit) => {
  return html`<div>
    ${state.cache(AudioSelect, 'select-audio').render()}
  </div>`
}
