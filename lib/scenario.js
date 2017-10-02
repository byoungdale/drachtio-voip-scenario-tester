'use strict';

const registrationHandler = require('./registrationHandler');
const async = require('async');
const incall = require('./incall');
const call = require('./call');

const run = (config, srf) => {
  registrationHandler.register(config.user, srf, (config, srf, expires) => {
    registrationHandler.reRegister(config, srf, expires);
  }); // registrationHandler

  setTimeout(() => {
    call.send(srf, '1000', config.user, (err, ep, dialog) => {
      async.series([
        incall.playRecording.bind(null, ep, dialog, ['ivr/8000/ivr-oh_whatever.wav', 'ivr/8000/ivr-no_calls_waiting_in_queue.wav', 'ivr/8000/ivr-you_are_about_to_provision_this_phone.wav','ivr-usage_totals_have_been_reset.wav']),
        incall.modifyCall.bind(null, ep, dialog, true)
      ], () => {
        incall.end(ep, dialog);
      }); // async.series
    }); // call.send
  }, 1000); // setTimeout
}; // run

const actions = () => {

}

module.exports.run = run;
