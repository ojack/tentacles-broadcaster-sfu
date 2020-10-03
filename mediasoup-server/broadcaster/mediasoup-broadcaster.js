const Room = require('./lib/room.js')

module.exports = ({ server = `ws://localhost:2345`, onUpdate = () => {}}) => {
  const room = new Room()
  const _peers = []
  const producers = { video: null, audio: null }
  room.join(server)

  const broadcastAudio = async (track) => {
    room.sendAudio(track)
  }

  const broadcastVideo = async (track) => {
    // if(producers.video !== null) {
    //   console.log('replacing track', producers.video)
    //   producers.video.replaceTrack(track)
    // } else {
    if(track !== null) {
      const producer = await room.sendVideo(track)
      console.log('producer is', producer)
      if(producers.video !== null) producers.video.close()
      producers.video = producer
    } else {
      console.log('closing producer', producers.video, producers.video.track)
    //  producers.video.close()

      room._closeProducer(producers.video)
      // producers.video.track.stop()
      producers.video = null
    }
  //  }
  }



  room.once("@open", ({ peers }) => {
    console.log(`${peers.length} peers in this room.`, peers);
    peers.forEach((peer) => _peers.push(peer))

    room.on("@peerJoined", (obj) => {
      const {peerId} = obj
      console.log("new peer joined", peerId, room, obj);
      _peers.push(peerId)
      console.log(peers)
      onUpdate()
    });

    room.on("@peerClosed", ({ peerId }) => {
      console.log("peer left", peerId);
      _peers.splice(_peers.indexOf(peerId), 1)
      console.log(peers)
      onUpdate()
    });

    room.on("@producerClosed", ({ producerId }) => {
      console.log('producer closed')
      //removeMediaEl(localTracks, "data-search-id", producerId);
    });
  })

  return {
    room: room,
    peers: _peers,
    broadcastVideo: broadcastVideo
  //  updateBroadcast
  }
}
