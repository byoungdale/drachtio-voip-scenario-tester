'use strict';

const registrationHandler = require('./registrationHandler');
const async = require('async');
const {
  playRecording,
  sendDTMF,
  onReinvite,
  modifyCall,
  transfer,
  end
} = require('./incall');
const { send, receive } = require('./call');

const call_1 = (config, srf) => {
  const { user_1, user_2 } = config;
  setTimeout(() => {
    send(srf, '1000', user_1, (err, ep, dialog) => {
      async.series([
        playRecording.bind(null, ep, dialog, ['ivr/8000/ivr-oh_whatever.wav']),
        transfer.bind(null, ep, dialog, user_2.username, user_1.username, user_2.domain),
      ], () => {
        end(ep, dialog);
      }); // async.series
    }); // call.send
  }, 1000); // setTimeout

  receive(srf, config.user_2, (ep, dialog) => {
    async.series([
      playRecording.bind(null, ep, dialog, ['ivr/8000/ivr-oh_whatever.wav']),
    ], () => {
      end(ep, dialog);
    }); // async.series
  }); // call.receive
}

const run = (config, srf) => {
  registrationHandler.register(config.user_1, srf, (config, srf, expires) => {
    registrationHandler.reRegister(config, srf, expires);
  }); // registrationHandler

  registrationHandler.register(config.user_2, srf, (config, srf, expires) => {
    registrationHandler.reRegister(config, srf, expires);
  }); // registrationHandler

  call_1(config, srf);
}; // run

module.exports.run = run;
