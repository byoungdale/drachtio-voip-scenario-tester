'use strict';

const {
  register,
  reRegister,
} = require('./registrationHandler');
const {
  user_1,
  user_2,
} = require('../config.js');
const Call = require('./call');

const scenario = (config, srf) => {
  register(user_1, srf).then((expires) => { reRegister(user_1, srf, expires); });
  register(user_2, srf).then((expires) => { reRegister(user_2, srf, expires); });

  const userOneCall = new Call(user_1, srf);
  const userTwoCall = new Call(user_2, srf);

  userOneCall.receive().then((incall) => {
    incall.playRecording(['ivr/8000/ivr-oh_whatever.wav']);
    incall.playRecording(['ivr/8000/ivr-oh_whatever.wav']);
    incall.playRecording(['ivr/8000/ivr-oh_whatever.wav']);
  });
  setTimeout(() => {
    userTwoCall.send('1001', user_2).then((incall) => {
      incall.playRecording([
        'misc/8000/we_are_trying_to_reach.wav',
        'digits/8000/1.wav',
        'digits/8000/thousand.wav',
      ]);
      incall.transfer('1002', '1000', user_2.domain);
      incall.playRecording(['misc/8000/misc-wide_range_of_persons.wav']);
    });
  }, 1000);
};

const run = (config, srf) => {
  scenario(config, srf);
}; // run

module.exports.run = run;
