const registrationHandler = require('./registrationHandler');
const async = require('async');
const incall = require('./incall');
const call = require('./call');

const run = (config, srf) => {
  registrationHandler.register(config.user, srf, (expires) => {
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
    });
  });

  call.receive(config.user, srf, (ep, dialog) => {
    async.series([
      function (callback) {
        incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav', 'ivr/8000/ivr-yes_we_have_no_bananas.wav'], callback);
      },
    ], () => {
      incall.end(ep, dialog);
    }); // async.series
  }); // call.receive

  setTimeout(() => {
    call.send(srf, '1000', config.user, (err, ep, dialog) => {
      async.series([
        function (callback) {
          incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav', 'ivr/8000/ivr-yes_we_have_no_bananas.wav'], callback);
        },
        function (callback) {
          incall.modifyCall(ep, dialog, 'hold', callback);
        },
        function (callback) {
          setTimeout(() => {
            incall.modifyCall(ep, dialog, 'unhold', callback);
          }, 10000);
        },
        function (callback) {
          incall.playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav'], callback);
        },
      ], () => {
        incall.end(ep, dialog);
      }); // async.series
    }); // call.send
  }, 2000); // setTimeout
};

module.exports.run = run;
