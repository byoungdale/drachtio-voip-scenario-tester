'use strict' ;

const mediaServers = [] ;

const MediaResources = {

  addMediaServer: function(ms) {
    mediaServers.push( ms ) ;
  },

  getMediaServer: function() {
    console.log(`you have ${mediaServers.length} mediaServers`);
    return mediaServers[0] ;
  }

} ;

module.exports.MediaResources = MediaResources ;
module.exports.mediaServers = mediaServers;
