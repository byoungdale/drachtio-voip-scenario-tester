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
const sdp = require('./lib/sdp');
const os = require('os');
// make this into a user constructor function
// then it will be easier to make multiple users
// for use with multiple users/scenarios

const ipAddress = os.networkInterfaces().eth1[0].address;
const localSdp = sdp.produceSdp(ipAddress);

const opts = {
  domain: 'sip.phone.com',
  user: 	120347,
  password: 'Ty5rq4vP3@m7c2',
  hostport: 5060,
  localAddress: ipAddress,
  localSdp: localSdp
}

/*
const opts = {
  domain: 'sip.qa.phone.com',
  user: 	124331,
  password: 'NyhEC6OvZ',
  hostport: 5060,
  callednumber: 17606590215,
}
*/
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
  listenPort: 8081
} ;

srf.connect(drachtioConnectOpts) ;

mrf.connect(mediaserverConnectOpts, (ms) => {
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

/*
setTimeout(() => {
  call.send(srf, '501', opts, (err, ep, dialog) => {
    if (err) { throw err; }
    console.log(dialog);
    incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav']);
  });
}, 2000);
*/

call.receive(opts, srf, (req, res, opts) => {
  call.connect(req, res, opts, (ep, dialog) => {
    incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav']);
    setTimeout(() => { incall.sendDTMF(ep, dialog, '*2'); }, 5000);
    setTimeout(() => { incall.sendDTMF(ep, dialog, '7609946034'); }, 6000);
  });
});
