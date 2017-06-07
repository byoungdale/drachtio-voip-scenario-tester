const mediaServers = [];

const MediaResources = {

  addMediaServer(ms) {
    mediaServers.push(ms);
  },

  getMediaServer() {
    return mediaServers[0];
  },
};

module.exports.MediaResources = MediaResources;
module.exports.mediaServers = mediaServers;
