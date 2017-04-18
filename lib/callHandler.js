'use strict' ;

const async = require('async') ;
const MediaServices = require('./media-services') ;

const onEndpointDeleted = ( /*ep , evt*/) => {
  console.log('received hangup from far end') ;
}

const receiveCall = (srf, callOpts) => {
  // callOpts is an array of functions to run after
  // the call is answered
  // example:
  // [playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav']),
  //  holdCall(ep, dialog, hold),
  //  playRecording(ep, dialog, ['voicemail/8000/vm-goodbye.wav']),
  //  

  srf.invite( function(req, res) {
    // get a media server to connect to
    const ms = MediaServices.MediaResources.getMediaServer() ;
    if( !ms ) {
      console.log(`no ms. Sending 480`);
      return res.send(480) ;
    }

    ms.connectCaller(req,res, (err, ep, dialog) => {
      if (err) { throw err; }

      res.send(200, {
        body: ep.local.sdp
      }, () => {
        playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav']);
      });

      dialog
      .on('destroy', onCallerHangup.bind(dialog, ep, null))
      .on('modify', onReinvite.bind(dialog, dialog));
    }); // ms.connectCaller

  }) ; // app.invite
} ;

const makeCall = (ep, dialog, ani, digits, callback) => {
  srf.createUacDialog('sip:' + digits + '@' + gateway, {
    localSdp: dialog.remote.sdp,
    callingNumber: ani,
    headers: {
      'User-Agent': 'drachtio sip tester'
    },
    auth: {
      username: opts.user,
      password: opts.password
  }, function(err, calledDialog) {
    if( err ) { return callback(err, ep, dialog); }

    playRecording(ep, dialog, ['ivr/8000/ivr-oh_whatever.wav']);

    //set up dialog handlers for called party
    dialog
    .on('destroy', onCalledPartyHangup.bind(calledDialog, dialog))
    .on('modify', onReinvite.bind(calledDialog, calledDialog)) ;

    callback(null, ep, dialog, calledDialog) ;
  }
});
}

const sendDTMF = (ep, dialog, digits) => {
  ep.api('send_dtmf', digits.toString(), (err, results) => {
    if (err) { return callback(err); }
    console.log(`sending DTMF: ${digits} on dialog: %{JSON.stringify(dialog)}`);
  })
}

const playRecording = (ep, dialog, recording) => {
  ep.play(recording, (err, results) => {
    if( err ) { return callback(err); }
    console.log(`playing ${recording}`);
    //callback(null, ep, dialog, recording);
  })
}

const holdCall = (ep, dialog) => {
  dialog.modify(hold);
}

const unholdCall = (ep, dialog) => {
  dialog.modify(unhold);
}

// dialog event handlers
const onCallerHangup = ( ep, calledDialog ) => {
  if( ep )  { ep.destroy() ; }
  if( calledDialog ) { calledDialog.destroy(); }
}
const onCalledPartyHangup = ( callerDialog ) => {
  // hang up on caller
  callerDialog.destroy() ;
}
const onReinvite = ( dialog, req, res ) => {
  console.log('got reINVITE from far end for dialog ', JSON.stringify(dialog)) ;
  res.send(200, {
    body: dialog.local.sdp
  }) ;
}

module.exports.receiveCall = receiveCall;
