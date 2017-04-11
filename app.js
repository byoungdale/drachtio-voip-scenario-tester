'use strict' ;

const drachtio = require('drachtio') ;
const app = drachtio();
const Mrf = require('drachtio-fsmrf');
const mrf = new Mrf(app) ;
const Srf = require('drachtio-srf') ;
const srf = new Srf(app) ;
const MediaServices = require('./lib/media-services') ;
var debug = require('debug');
const registrationHandler = require('./lib/registrationHandler');
const callHandler = require('./lib/callHandler');

const opts = {
  domain: 'sip.qa.phone.com',
  user: 	124331,
  password: 'NyhEC6OvZ',
  hostport: 5060,
  callednumber: 17606590215,
}

const drachtioConnectOpts = {
  host: 'localhost',
  port: 8022,
  secret: 'cymru'
} ;

const mediaserverConnectOpts = {
  address: '127.0.0.1',
  port: 8021,
  secret: 'ClueCon',
  listenAddress: '127.0.0.1',
  listenPort: 8085
} ;

srf.connect(drachtioConnectOpts) ;

mrf.connect(mediaserverConnectOpts, (err, mediaServer) => {
  if (err) { debug(err) ; }
  mediaServer.on('connect', (err, ms) => {
    if (err) { debug(err); }
    console.log('connected to media server listening on %s:%s', ms.sipAddress, ms.sipPort) ;
    MediaServices.addMediaServer( ms ) ;
    });
  }) ;

srf.on('connect', (err, hostport) => {
  console.log('connected to drachtio listening for SIP on %s', hostport) ;
}) ;


// registerUser function's callback receives expires variable
// from the 200 OK back from the registrar
/*
registrationHandler.register(opts, srf, (opts, srf, expires) => {
  console.log(`re-registering`);
  srf.request(`sip:${opts.user}@${opts.domain}`, {
      method: 'REGISTER',
      headers: {
          'Expires': expires,
          'From': `sip:${opts.user}@${opts.domain}`,
          'Contact': `sip:${opts.user}@${opts.domain}:${opts.hostport}`
      },
      auth: {
        username: opts.user,
        password: opts.password
      }
  });
});

callHandler.receiveCall(srf);
*/
