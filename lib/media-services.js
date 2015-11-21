'use strict' ;

var mediaServers = [] ;

var MediaResources = {

  addMediaServer: function(ms) {
    mediaServers.push( ms ) ;
  }, 

  getMediaServer: function() {
    return mediaServers[0] ;
  }
} ;

exports = module.exports = MediaResources ;
