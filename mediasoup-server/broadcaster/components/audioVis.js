var html = require('choo/html')
var Component = require('choo/component')

module.exports = class AudioVis extends Component {
  constructor () {
    super()
    this.stream = null
    this.audioCtx = new AudioContext()
  }

  update(stream) {
      this.audioCtx.resume()
    if(stream !== this.stream) {
      this.stream = stream
      this.updateStream()
    }
    return false
  }

  load() {
    this.audioCtx.resume()
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.smoothingTimeConstant = 0.8
    this.analyser.fftSize = 512
    this.ctx = this.canvas.getContext('2d')
    var bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength)
    this.updateStream()
    this.visualize()

  }

  unload() {
    window.cancelAnimationFrame(this.animation)
  }

  updateStream() {
    console.log('UPDATING stream', this.stream)
      this.updateSettings(this.parent)
      if(this.source) this.source.disconnect()
      if(this.stream !== null) {

        if(this.stream.getAudioTracks().length > 0) {
          // const track = this.stream.getAudioTracks()[0]
          // const stream = new MediaStream([track])
          // this.source = this.audioCtx.createMediaStreamSource(stream)
          this.source = this.audioCtx.createMediaStreamSource(this.stream)
          console.log('setting stream', this.stream, this.analyser, this.source)
          this.source.connect(this.analyser)
        //  this.stream = stream
          // debug
        //  this.source.connect(this.audioCtx.destination)
        }
        this.audioEl.srcObject = this.stream
      }
  //  }
  }

  updateSettings(parent) {
    let details = null
    this.details.innerHTML = ''
    if(this.stream !== null){
      console.log('selected', parent.selectedDevice)
      const track = this.stream.getAudioTracks()[0]
      if(track) {
        const settings = track.getSettings()
        const constraints = track.getConstraints()
        console.log('track', track, 'settings', settings, constraints)

        const keys = ['echoCancellation', 'autoGainControl', 'noiseSuppression', 'channelCount', 'latency', 'sampleRate', 'sampleSize']
        details = html`<div>${keys.map((key) => {
          let color = ""
          if(key in constraints && constraints[key] !== settings[key] && key !== 'latency') color = "red"
          console.log( constraints[key], settings[key], color)
          return html`<div
          class="${color}">${key} : ${settings[key]}</div>`
        })}</div>`
        this.details.appendChild(details)

        // show details of selected device
        const device = parent.devices.filter((device) => device.deviceId === settings.deviceId)[0]
        if(device) {
          this.details.appendChild(html`<div
            class="${constraints.deviceId && constraints.deviceId !== settings.deviceId ? 'red': ''}"
            >device: ${device.label}</div>`)
        }
      }
    }



  }

  visualize() {
  //  console.log('visualizing', this.stream)
    this.analyser.getByteFrequencyData(this.dataArray)
    this.animation = requestAnimationFrame(this.visualize.bind(this))
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    var bufferLength = this.analyser.frequencyBinCount
    var barWidth = (this.canvas.width / bufferLength) ;
    var barHeight;
    var x = 0
    for(var i = 0; i < bufferLength; i++) {
            barHeight = this.dataArray[i] + 10;
        //    if(barHeight > 10) console.log(barHeight)
            this.ctx.fillStyle = 'rgb(' + (barHeight+100) + ',250,250)';
            this.ctx.fillRect(x,this.canvas.height-barHeight/2,barWidth,barHeight);

            x += barWidth + 1;
      }
  }

  createElement(stream, parent) {

    this.canvas = html`<canvas></canvas>`
    this.canvas.height = 100

    this.stream = stream
    this.parent = parent

    this.isActive = false

    this.details = html`<div></div>`
    this.audioEl = html`<audio controls class="h2"></audio>`

    return html`<div class="relative">${this.canvas}
          ${this.audioEl}
        <div class="absolute f7 silver top-0 right-0 ttn" style="width:12rem">
          ${this.details}
        </div>
      </div>`
  }
}
