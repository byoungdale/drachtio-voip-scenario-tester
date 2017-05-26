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
const async = require('async');

const config = require('./config');
const Call = require('./lib/call');
const call = new Call(config, srf);
const incall = require('./lib/incall');

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

// ideal final setup
// scenario.run(scenarioOpts)
// OR
// for multiple scenarios
/*
scenarioOpts.map((test) => {
  scenario.run(test);
});
*/

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

/*
call.receive(config.user, srf, (ep, dialog) => {
  async.series([
    function(callback) {
      incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav'], callback);
    },
    function(callback) {
      incall.playRecording(ep, dialog, ['ivr/8000/ivr-yes_we_have_no_bananas.wav'], callback);
    }
  ], (err, results) => {
    incall.end(ep, dialog);
  }); // async.series
}); // call.receive
*/

setTimeout(() => {
  call.send(srf, '1000', config.user, (err, ep, dialog) => {
    async.series([
      function(callback) {
        incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav'], callback);
      },
      function(callback) {
        incall.playRecording(ep, dialog, ['ivr/8000/ivr-yes_we_have_no_bananas.wav'], callback);
      }
    ], (err, results) => {
      incall.end(ep, dialog);
    }); // async.series
  }); // call.send
}, 2000); //setTimeout
