'use strict' ;

const async = require('async') ;
const MediaServices = require('./media-services') ;

const onEndpointDeleted = ( /*ep , evt*/) => {
  console.log('received hangup from far end') ;
}

const receiveCall = (srf) => {

  srf.invite( function(req, res) {
    console.log(`received: ${req.method}`)
    // get a media server to connect to
    console.log(MediaServices.mediaServers);
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
        console.log('sent 200 OK, received ack');

        ep.play(['./static/ivr-oh_whatever.wav'], (err, results) => {
          console.log(`results: ${results}`);
        });
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
      'User-Agent': 'brandon sip tester'
    },
    auth: {
      username: opts.user,
      password: opts.password
  }, function(err, calledDialog) {
    if( err ) { return callback(err, ep, dialog); }

    dialog.modify(calledDialog.remote.sdp) ;

    // no need for endpoint any more
    ep.destroy() ;

    //update handler for calling party hangup
    dialog
    .removeAllListeners('destroy')
    .on('destroy', onCallerHangup.bind(dialog, null, calledDialog)) ;

    //set up dialog handlers for called party
    calledDialog
    .on('destroy', onCalledPartyHangup.bind(calledDialog, dialog))
    .on('modify', onReinvite.bind(calledDialog, calledDialog)) ;

    callback(null, ep, dialog, calledDialog) ;
  }
});
}

const playDTMF = (ep, dialog, digit, callback) => {
  var file = `./recordings/Dtmf-${digit}.wav`;
  ep.play([file], function(err, results) {
    if( err ) { return callback(err) ;}
    console.log('collected digits: %s', results.digits) ;
    callback(null, ep, dialog, ani, results.digits) ;
  });

}

const playDigits = (ep, dialog, digits) => {

}

const playRecording = (ep, dialog, recording) => {
  ep.play(recording, (err, results) => {
    if( err ) { return callback(err); }
    console.log(`playing ${recording}`);
    callback(null, ep, dialog, recording);
  })
}

const holdCall = (ep, dialog, hold) => {
  dialog.modify(hold);
}

const unholdCall = (ep, dialog, hold) => {
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
