const Room = require('./lib/room.js')

module.exports = ({ server = `ws://localhost:2345`, onUpdate = () => {}, streamKey = "test"}) => {
  const room = new Room()
  const _peers = []
  const producers = { video: null, audio: null }

  const serverURL = `${server}/?stream=${streamKey}`
  console.log('joining', serverURL)
  room.join(serverURL)

  const broadcastAudio = async (track) => {
    room.sendAudio(track)
  }

  const updateBroadcast = (tracks) => {
    Object.keys(tracks).forEach((kind) => {
      updateMedia(tracks[kind], kind)
    })
  }

  const updateMedia = async (track, kind) => {
    if(track !== null) {
      console.log(track, producers[kind])
      if(producers[kind] === null) {
        let producer
        if(kind === 'video') {
          producer = await room.sendVideo(track)
        } else {
          producer = await room.sendAudio(track)
        }
        // console.log('producer is', producer)
        // if(producers[kind] !== null) producers[kind].close()
        producers[kind] = producer
      } else {
         if(track !== producers[kind].track) {
           let producer
           if(kind === 'video') {
             producer = await room.sendVideo(track)
           } else {
             producer = await room.sendAudio(track)
           }
           room._closeProducer(producers[kind])
           producers[kind] = producer
         } else {
           console.log('track already exists!')
         }
      }
    } else {
      if(producers[kind] !== null) {
        console.log('closing producer', producers[kind], producers[kind].track)
      //  producers[kind].close()

        room._closeProducer(producers[kind])
        // producers[kind].track.stop()
        producers[kind] = null
      }
    }
  }


  room.once("@open", ({ peers }) => {
    console.log(`${peers.length} peers in this room.`, peers);
    onUpdate()
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
    // broadcastVideo: broadcastVideo,
    updateBroadcast: updateBroadcast
  //  updateBroadcast
  }
}
