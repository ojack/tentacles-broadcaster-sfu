const Room = require('./lib/room.js')

module.exports = ({ server = `ws://localhost:2345`, onUpdate = () => {}}) => {
  const room = new Room()
  const _peers = []
  room.join(server)

  const broadcastAudio = (track) => {
    room.sendAudio(track)
  }

  const broadcastVideo = (track) => {
    room.sendVideo(track)
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
      //removeMediaEl(localTracks, "data-search-id", producerId);
    });
  })

  return {
    room: room,
    peers: _peers,
    broadcastVideo: broadcastVideo
  }
}
