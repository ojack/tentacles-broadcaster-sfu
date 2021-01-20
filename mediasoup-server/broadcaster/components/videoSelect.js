const Component = require('choo/component')
const Video = require('./VideoObj.js')
const html = require('choo/html')
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

const toggle = (val, onChange) => html`
  <input type="checkbox" checked=${val} onchange=${onChange} />
`

const expandable = (isOpen, content, maxHeight = '300px') => html`
  <div class="overflow-hidden" style="transition: max-height 1s;max-height:${isOpen
  ? maxHeight
  : 0}">
    ${content}
  </div>
`

module.exports = class VideoSelect extends Component {
  constructor (opts) {
    super(opts)
    this.previewVideo = new Video()
    this.devices = []
    this.selectedDevice = { label: 'initial', deviceId: '' }
    this.track = null
    this.trackInfo = {}
    this.stream = null
    this.isActive = false
    this.constraints =  { width: 1920, height: 1080, frameRate: 30 }
  }

  updateDeviceList (callback) {
      enumerateDevices()
        .then(devices => {
          this.devices = devices.filter(elem => elem.kind == 'videoinput')
          this.devices.push({ label: 'screen capture', deviceId: 'screen' })
          this.devices.push({ label: 'no video', deviceId: 'false' })
          console.log('getting devices!', this.devices)
          callback()
        })
        .catch(err => this.log('error', err))
  }

  // stub for now
  update (opts) {
    return false
  }

  load (el) {
    // update with initial devices
    this.updateDeviceList(() => {
      if (this.devices.length > 0) {
        this.selectedDevice = this.devices[this.devices.length -
          1]
      }
      this.getMedia()
    })
  }

  applyConstraints (obj = {}) {
    this.constraints = Object.assign({}, this.constraints, obj)
    console.log(
      `%c applying video constraints `,
      'background: #ff9900; color: #fff',
      this.constraints
    )
    this.track
      .applyConstraints(this.constraints)
      .then(() => {
        this.trackInfo = this.track.getSettings()
        this.showTrackInfo(this.track)
          this.rerender()
   // Do something with the track such as using the Image Capture API.
         }).catch(e => {
           console.log(e)
         });
    // this.trackInfo[kind] = this.tracks[kind].getSettings()
    // this.rerender()
  }

  // @todo: what happens if screen share has audio
  getScreen() {
    navigator.mediaDevices
     .getDisplayMedia({ video: true, audio: true })
     .then(stream => {
       this.stream = stream
       this.track = stream.getVideoTracks()[0]
       this.showTrackInfo(this.track)
       this.applyConstraints()
       this.onChange(this.track)
       this.rerender()
     })
     .catch(console.error);
  }

  getMedia () {
    let initialConstraints = { audio: false, video: false }
     if (this.isActive) {

      initialConstraints.video = {
        deviceId: this.selectedDevice.deviceId
      }
        if (this.track !== null) {
          this.track.stop()
          this.track = null
        }
        console.log('getting media', initialConstraints)
      if(this.selectedDevice.deviceId === 'screen') {
        this.getScreen()
      } else {
        navigator.mediaDevices
         .getUserMedia(initialConstraints)
         .then(stream => {
           this.track = stream
             .getTracks()
             .filter(track => track.kind == 'video')[0]
           this.stream = stream
           this.showTrackInfo(this.track)
           this.applyConstraints()
           this.rerender()
           this.onChange(this.track)
         })
         .catch(err => {
           console.log('error', err)
         })
      }
    } else {
      this.track = null
      this.stream = null
      this.onChange(this.track)
      this.rerender()
    }
  }

  showTrackInfo(track) {
    console.log(
      `%c ${track.kind} constraints applied `,
      'background: #ffcc66; color: #fff',
      track.getConstraints()
    )
    console.log(
      `%c ${track.kind} settings `,
      'background: #ff4466; color: #fff',
      track.getSettings()
    )
  }

  createElement ({ onChange = () => console.log("no change handler for media selector")}) {
    this.onChange = onChange
  //  this.parentOpts = opts

    const videoSelect = html`<select name="video-select" class="w-100 pa2 white ttu ba b--white pointer" style="background:none" onchange=${e => {
      this.selectedDevice = this.devices.filter( device => device.deviceId === e.target.value)[0]
      this.isActive = this.selectedDevice.deviceId === 'false' ? this.isActive = false : this.isActive = true
      this.getMedia()
    }}>${dropdown(
          this.devices.map((device, index) => ({
            value: device.deviceId,
            label: device.label
          })),
          this.selectedDevice.deviceId
        )}
    </select>`

    let vid = this.previewVideo.render(this.stream, {
      objectPosition: 'center'
    })

    var videoSettings = Object.keys(this.constraints).map(
      constraint => html`
  <div class="flex-auto w3 mt2">
  <div>${constraint === 'frameRate' ? 'fps' : constraint}</div>
  <input type="text" value=${this.constraints[constraint]} class="pa2 ba b--white white w-100" style="background:none" onkeyup=${e => {
    if (parseInt(e.srcElement.value)) {
      this.applyConstraints({
        [constraint]: parseInt(e.srcElement.value)
      })
    }
  }}> </input>
  </div>`
    )

    let vidInfo = this.trackInfo.width
      ? `${this.trackInfo.width}x${this.trackInfo.height}@${this.trackInfo.frameRate}fps`
      : ''

    return html`<div class="flex flex-column mw6 w-100">
      <div>Video input</div>
      <div>${videoSelect}</div>
      ${expandable(
      this.isActive,
      html`
        <div class="mt4 flex justify-between"><div>Video preview</div><div>${vidInfo}</div></div>
        <div class="w-100 h4 h5-ns ba b--white">${vid}</div>
        <div class="flex flex-wrap mt4">${videoSettings} </div>`,
      '500px'
    )}
    </div>`
  }
}
