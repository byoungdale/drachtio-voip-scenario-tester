'use strict';

const registrationHandler = require('./registrationHandler');
const async = require('async');
const incall = require('./incall');
const call = require('./call');

const run = (config, srf) => {
  registrationHandler.register(config.user, srf, (config, srf, expires) => {
    srf.request(`sip:${config.username}@${config.domain}`, {
      method: 'REGISTER',
      headers: {
        Expires: expires,
        From: `sip:${config.username}@${config.domain}`,
        Contact: `sip:${config.username}@${config.domain}:${config.hostport}`,
      },
      auth: {
        username: config.username,
        password: config.password,
      },
    }); // srf.request
  }); // run

  call.receive(config.user, srf, (ep, dialog) => {
    async.series([
      function (callback) {
        incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav', 'ivr/8000/ivr-yes_we_have_no_bananas.wav'], callback);
      },
      function (callback) {
        incall.sendDTMF(ep, dialog, '17609946034', callback);
      },
      function (callback) {
        incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav', 'ivr/8000/ivr-yes_we_have_no_bananas.wav'], callback);
      },
    ], () => {
      incall.end(ep, dialog);
    }); // async.series
  }); // call.receive

  setTimeout(() => {
    call.send(srf, '400', config.user, (err, ep, dialog) => {
      async.series([
        function (callback) {
          incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav', 'ivr/8000/ivr-yes_we_have_no_bananas.wav'], callback);
        },
        function (callback) {
          setTimeout(() => {
            incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav'], callback);
          }, 10000);
        },
      ], () => {
        incall.end(ep, dialog);
      }); // async.series
    }); // call.send
  }, 500000); // setTimeout
}; // run

module.exports.run = run;
