const AudioVis = require('./audioVis.js')
const Component = require('choo/component')
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
const constraintNames = {
  echoCancellation: 'echo cancellation',
  autoGainControl: 'auto gain',
  noiseSuppression: 'noise suppression'
}

module.exports = class AudioSelect extends Component {
  constructor (opts) {
    super(opts)
    this.audioVis = new AudioVis()
    this.devices = []
    this.selectedDevice = { label: 'initial', deviceId: '' }
    this.track = null
    this.trackInfo = {}
    this.stream = null
    this.isActive = false
    this.constraints = {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppression: false,
    }
  }

  updateDeviceList (callback) {
      enumerateDevices()
        .then(devices => {
          this.devices = devices.filter(elem => elem.kind == 'audioinput')
          this.devices.push({ label: 'no audio', deviceId: 'false' })
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
      this.getMedia('audio')
    })
  }

  getMedia () {

    let initialConstraints = { audio: false, video: false }
     if (this.isActive) {
      initialConstraints.audio = {
        deviceId: this.selectedDevice.deviceId
      }
    //  if (kind === 'audio') {
        initialConstraints.audio = Object.assign(
          {},
          initialConstraints.audio,
          this.constraints,
          {
            latency: 0,
            //channelCount: 2
          }
        )
        if (this.track !== null) {
          this.track.stop()
          this.track = null
        }
        console.log('getting media', initialConstraints)
      navigator.mediaDevices
        .getUserMedia(initialConstraints)
        .then(stream => {
          this.track = stream
            .getTracks()
            .filter(track => track.kind == 'audio')[0]
          this.stream = stream
          this.showTrackInfo(this.track)
          this.onChange(this.track)
          this.rerender()
        })
        .catch(err => {
          console.log('error', err)
        })
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

    const audioSelect = html`<select name="audio" class="w-100 pa2 white ttu ba b--white pointer" style="background:none" onchange=${e => {
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

    const audioSettings = Object.keys(this.constraints).map(
      constraint => html`<div class="flex w-100 justify-between">
    <div class="">${constraintNames[constraint]}</div>
    <input type="checkbox" id=${constraint} name=${constraint} checked=${this.constraints[constraint]}
    onchange=${e => {
      this.constraints[constraint] = e.target.checked
      this.getMedia()
    }}>
    </div>`
    )

    return html`<div class="flex flex-column mw6 w-100 mt4">
      <div>Audio input</div>
      <div class="">${audioSelect}</div>
      ${expandable(
        this.isActive,
        html`<div class="mt4">Audio meter</div>
            <div class="ba b--white">
            ${this.audioVis.render(this.stream, this)}
            </div>
            <div class="mt4 flex flex-column">
              <div class="flex flex-wrap">${audioSettings}</div>
            </div>`
    )}
    </div>`
  }
}
