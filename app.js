'use strict' ;

var drachtio = require('drachtio') ;
var app = drachtio() ;
var Mrf = require('drachtio-fsmrf') ;
var Srf = require('drachtio-srf') ;
var mrf = app.mrf = new Mrf(app) ;
app.srf = new Srf(app) ;
var MediaServices = require('./lib/media-services') ;
var argv = require('minimist')(process.argv.slice(2));
var debug = app.debug = require('debug')('drachtio-sample') ;

if( !argv.gateway ) {
    console.error('Usage: node index.js --gateway \'outbound-gateway-ip-address\'') ;
    process.exit(-1) ;
}
app.gateway = argv.gateway ;

var drachtioConnectOpts = { host: 'localhost', port: 8022, secret: 'cymru'} ;
var mediaserverConnectOpts = { address: '127.0.0.1', port: 8021, secret: 'ClueCon', listenPort: 8085 } ;

app.connect(drachtioConnectOpts) ;
mrf.connect(mediaserverConnectOpts) ;

app.on('connect', function(err, hostport) {
  console.log('connected to drachtio listening for SIP on %s', hostport) ;
}) ;

mrf.on('connect', function(ms) {
  console.log('connected to media server listening on %s:%s', ms.sipAddress, ms.sipPort) ;
  MediaServices.addMediaServer( ms ) ;
}) ;

//load routes
require('./lib/invite')(app) ;


