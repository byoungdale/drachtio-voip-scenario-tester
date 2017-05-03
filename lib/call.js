// const async = require('async');
const MediaServices = require('./media-services');

const sendDTMF = (ep, dialog, digits) => {
  ep.getChannelVariables(false, (channel) => {
    const uuid = channel['Channel-Call-UUID'];
    ep.api('uuid_send_dtmf', [uuid, digits.toString()], (err, results) => {
      if (err) { return err; }
      return results;
    }); // ep.api
  }); // ep.getChannelVariables
}; // sendDTMF

const playRecording = (ep, dialog, recording) => {
  ep.play(recording, (err, results) => {
    if (err) { return err; }
    return results;
  }); // ep.play
}; // playRecording

/*
need to clean this up

if this function is run, modify state of callback
if on hold, go off hold. vice versa

*/
const modifyCall = ((ep, dialog, hold) => { return hold; });

// dialog event handlers
const onCallerHangup = (ep, calledDialog) => {
  if (ep)  { ep.destroy(); }
  if (calledDialog) { calledDialog.destroy(); }
};

const onCalledPartyHangup = (callerDialog) => {
  // hang up on caller
  callerDialog.destroy();
}; // onCalledPartyHangup

const onReinvite = (dialog, req, res) => {
  console.log('got reINVITE from far end for dialog ', JSON.stringify(dialog)) ;
  res.send(200, {
    body: dialog.local.sdp,
  }); // res.send
}; // onReinvite

const receive = (opts, srf, callback) => {
  srf.invite((req, res) => {
    // get a media server to connect to
    const ms = MediaServices.MediaResources.getMediaServer();
    if (!ms) {
      console.log(`no ms. Sending 480`);
      return res.send(480);
    } // check for media servers

    ms.connectCaller(req, res, (err, ep, dialog) => {
      if (err) { throw err; }
      res.send(200, { body: ep.local.sdp }, () => {
      callback(ep, dialog);
      }); // res.send
    }); // ms.connectCaller
  }); // srf.invite
}; // receive

const send = (srf, ep, dialog, ani, digits, opts, callback) => {
  srf.createUacDialog(`sip:${digits}@${opts.domain}`, {
    localSdp: dialog.remote.sdp,
    callingNumber: ani,
    headers: {
      'User-Agent': 'drachtio sip tester',
    },
    auth: {
      username: opts.user,
      password: opts.password,
    },
    function(err, calledDialog) {
      if (err) { return callback(err, ep, dialog); }

      playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav']);

      // set up dialog handlers for called party
      dialog
      .on('destroy', onCalledPartyHangup.bind(calledDialog, dialog))
      .on('modify', onReinvite.bind(calledDialog, calledDialog));

      callback(null, ep, dialog, calledDialog);
      return dialog;
    },
  }); // srf.createUacDialog
}; // send

module.exports.receive = receive;
module.exports.playRecording = playRecording;
module.exports.sendDTMF = sendDTMF;
