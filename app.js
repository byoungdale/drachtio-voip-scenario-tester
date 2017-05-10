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
const call = require('./lib/call');
const incall = require('./lib/incall');
const config = require('./config');

srf.connect(config.drachtioConnectOpts) ;

mrf.connect(config.mediaserverConnectOpts, (ms) => {
  console.log(`finally connected to mediaserver ${JSON.stringify(ms)}`);
  MediaServices.MediaResources.addMediaServer( ms ) ;
});

srf.on('connect', (err, hostport) => {
  console.log('connected to drachtio listening for SIP on %s', hostport) ;
}) ;

mrf.on('connect', (ms) => {
  if (err) { debug(err); }
  console.log('connected to media server listening on %s:%s', ms.sipAddress, ms.sipPort) ;
  MediaServices.addMediaServer( ms ) ;
});

// registerUser function's callback receives expires variable
// from the 200 OK back from the registrar

registrationHandler.register(config.user, srf, (opts, srf, expires) => {
  console.log(`re-registering`);
  srf.request(`sip:${opts.username}@${opts.domain}`, {
      method: 'REGISTER',
      headers: {
          'Expires': expires,
          'From': `sip:${opts.username}@${opts.domain}`,
          'Contact': `sip:${opts.username}@${opts.domain}:${opts.hostport}`
      },
      auth: {
        username: opts.username,
        password: opts.password
      }
  });
});


setTimeout(() => {
  call.getEndpoint(config.user, (ep) => {
    call.send(srf, ep, '1000', config.user, (err, ep, dialog) => {
      if (err) { throw err; }
      incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav']);
    }); // call.send
  }); // call.getEndpoit
}, 2000);

/*
call.receive(config.user, srf, (req, res, config.user) => {
  call.connect(req, res, config.user, (ep, dialog) => {
    incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav']);
    setTimeout(() => { incall.sendDTMF(ep, dialog, '*2'); }, 5000);
    setTimeout(() => { incall.sendDTMF(ep, dialog, '7609946034'); }, 6000);
  });
});
*/
