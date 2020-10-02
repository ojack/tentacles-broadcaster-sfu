const Room = require('./lib/room.js')

module.exports = ({ videoEl, server = `ws://localhost:2345`}) => {
  const room = new Room()
  room.join(server)

  if(!videoEl) {
    videoEl = document.createElement('video')
    videoEl.autoplay = true
    document.body.appendChild(videoEl)
  }
  const video = videoEl

  const tracks = { audio: null, video: null }

  room.on("@consumer", async consumer => {
    const {
      id,
      appData: { peerId },
      track
    } = consumer;
    console.log("receive consumer", consumer);
    //
    // const el = createMediaEl(track, peerId, id);
    // document.body.append(el)
    addTrack(track, peerId, id)
  });

  room.on("@consumerClosed", (consumer) => {
    console.log(consumer.id)
    removeTrack(consumer.id)
    //removeMediaEl(document.body, "data-search-id", consumerId);
  });

  room.on("@producerClosed", ({ producerId }) => {
  //  removeMediaEl(localTracks, "data-search-id", producerId);
  });

  room.on("@peerClosed", ({ peerId }) => {
  //  removeMediaEl(remoteTracks, "data-peer-id", peerId);
  });

  function addTrack(track, peerId, consumerId) {
    if(tracks[track.kind] !== null) {
      // remove track
    }
    tracks[track.kind] = {
      track: track,
      peerId: peerId,
      consumerId: consumerId
    }
    updateStream()
  }

  function updateStream() {
    console.log('updating stream', tracks)
    const stream = new MediaStream()
    if(tracks.audio !== null) stream.addTrack(tracks.audio.track)
    if(tracks.video !== null) stream.addTrack(tracks.video.track)
    video.srcObject = stream
  }

  function removeTrack(id) {
    console.log('removing tracks', id, tracks)
    if(tracks.audio !== null && tracks.audio.consumerId === id) {
      tracks.audio = null
    }
    if(tracks.video !== null && tracks.video.consumerId === id) {
      tracks.video = null
    }
    updateStream()
  }


  function createMediaEl(track, peerId, searchId) {
    const el = document.createElement(track.kind);
    el.srcObject = new MediaStream([track]);
    el.autoplay = true
    el.setAttribute("data-peer-id", peerId);
    el.setAttribute("data-search-id", searchId);
    el.playsInline = true;
  //  el.play().catch(console.error);
    return el;
  }

  return {
    room: room,
    tracks: tracks,
    server: server
  }
}
