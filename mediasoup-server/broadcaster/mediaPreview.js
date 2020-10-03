var html = require('choo/html')
var Component = require('choo/component')
const enumerateDevices = require('enumerate-devices')


const dropdown = (options, selected) => html`
${options.map(
  opt => html`
  <option class="dark-gray" value=${opt.value} ${opt.value === selected
    ? 'selected'
    : ''}>${opt.label}</option>
    `
  )}
  `

  module.exports = class MediaPreview extends Component {
    constructor (id, state, emit) {
      super(id)
      this.emit = emit
      state.preview = this
      this.local = state.components[id] = {}
      this.isActive = { audio: false, video: false }
      this.selectedDevices = {
        audio: { label: 'initial', deviceId: '' },
        video: { label: 'initial', deviceId: '' }
      }
      this.tracks = { audio: null, video: null }
      this.streams = { audio: null, video: null }
      this.devices = { audio: [], video: [] }
      this.mediaDivs = { audio: null, video: null}
      enumerateDevices()
      .then(devices => {
        this.devices.audio = devices.filter(elem => elem.kind == 'audioinput')
        this.devices.video = devices.filter(elem => elem.kind == 'videoinput')
        this.devices.audio.push({ label: 'no audio', deviceId: 'false' })
        this.devices.video.push({ label: 'screen', deviceId: 'screen' })
        this.devices.video.push({ label: 'no video', deviceId: 'false' })
        if (this.devices.audio.length > 0) {
          this.selectedDevices.audio = this.devices.audio[this.devices.audio.length -1]
        }
        if (this.devices.video.length > 0) {
          this.selectedDevices.video = this.devices.video[this.devices.video.length - 1]      }
          //callback()
          //  this.rerender()
          console.log('dropdown div', this.dropdownDiv)
          this.dropdownDiv.appendChild(html`<div>${this.renderDropdowns()}</div>`)
        })
        .catch(err => console.log('error', err))
      }

      load (element) {
        // const video  = document.createElement('video')
        // video.autoplay = true
        // this.mediaDivs.video = video
        // // this.mediaDivs.video.width = 600
        // // this.mediaDivs.video.height = 400
        // this.mediaDivs.audio = document.createElement('audio')
        // this.mediaDivs.audio.controls = true
        // this.innerDiv.appendChild(this.mediaDivs.video)
        // this.innerDiv.appendChild(this.mediaDivs.audio)
      }

      update (center) {
        // if (center.join() !== this.local.center.join()) {
        //   this.map.setCenter(center)
        // }
        return false
      }

      getScreen() {
        navigator.mediaDevices
         .getDisplayMedia({ video: true })
         .then(stream => {
           this.streams.video = stream
           this.tracks.video = stream.getVideoTracks()[0]
           this.mediaDivs.video.srcObject = stream
           this.emit('updateMedia')
          // stream.getVideoTracks()[0]
         })
         .catch(console.error);
      }

      /* Inconsistent behavior between audio and video for applying constraints.
      For video, appears to work better to apply constraints once stream is received.
      For audio, seems to work better to apply constraints when get user media is called */
      getMedia (kind) {
        let initialConstraints = { audio: false, video: false }
        if (this.isActive[kind]) {
          initialConstraints[kind] = {
            deviceId: this.selectedDevices[kind].deviceId
          }
          navigator.mediaDevices
          .getUserMedia(initialConstraints)
          .then(stream => {
            this.tracks[kind] = stream
            .getTracks()
            .filter(track => track.kind == kind)[0]
            this.streams[kind] = stream
            console.log( `%c got user media (${kind})`,'background: #0044ff; color: #f00',  stream.getTracks(),this.tracks)
          this.mediaDivs[kind].srcObject = stream
            this.emit('updateMedia')
        })
        .catch(err => {
          this.log('error', err)
        })
      } else {
        this.tracks[kind] = null
        this.streams[kind] = null
        this.mediaDivs[kind].srcObject = null
        this.emit('updateMedia')
        //  this.rerender()
      }
    }

    renderDropdowns() {
      const dropdowns = [ 'video', 'audio' ].map(
        kind =>
        html`
      <div class="mt4">
        <div>Select ${kind}:</div>
        <select name=${kind} class="w4 dim pa2 white ttu ba b--white pointer" style="background:none" onchange=${e => {
          this.selectedDevices[kind] = this.devices[kind].filter(
            device => device.deviceId === e.target.value
          )[0]
          if (this.selectedDevices[kind].deviceId === 'screen') {
            this.getScreen()
          } else {
            if (this.selectedDevices[kind].deviceId === 'false') {
              this.isActive[kind] = false
            } else {
              this.isActive[kind] = true
            }
            this.getMedia(kind)
          }
        }}>
        ${dropdown(
          this.devices[kind].map((device, index) => ({ value: device.deviceId, label: device.label })),
          this.selectedDevices[kind].deviceId
        )}
        </select>
        </div>`
      )
    //  console.log('dropdowns', dropdowns)
      //  this.dropdowns = dropdowns
      return dropdowns
    }

    createElement (center) {
      console.log(this)
      //this.local.center = center
      this.dropdownDiv = html`<div></div>`
      //  this.dropdownDiv.appendChild(this.renderDropdowns())
    //  this.innerDiv = html`<div id="preview-container"></div>`
      const video  = document.createElement('video')
      video.autoplay = true
      this.mediaDivs.video = video
      video.className = "w-100 h-100 bg-black"
      // this.mediaDivs.video.width = 600
      // this.mediaDivs.video.height = 400
      this.mediaDivs.audio = document.createElement('audio')
      this.mediaDivs.audio.controls = true
      return html`<div class="">
      ${this.dropdownDiv}
          <div class="w5 h5 mt4" style="width:100%;height:500px">
            Video preview
            ${this.mediaDivs.video}
          </div>
          <div class="mt4">
            <div> Audio preview </div>
            <div>${this.mediaDivs.audio}</div>
          </div>

      </div>`
    }
  }
