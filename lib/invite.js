'use strict' ;

var async = require('async') ;
var MediaServices = require('./media-services') ;
var debug ;
var srf ;
var gateway ;

module.exports = function(app) {

  srf = app.srf ;
  gateway = app.gateway ;
  debug = app.debug ;

  app.invite( function(req, res) {

    // get a media server to connect to
    var ms = MediaServices.getMediaServer() ;
    if( !ms ) {
      return res.send(480) ;
    }

    // connect caller to an endpoint on the media server
    ms.connectCaller( req, res, function(err, ep, dialog) {
      if( err ) { throw err; }

      // set up dialog handlers for caller
      dialog
      .on('destroy', onCallerHangup.bind(dialog, ep, null))
      .on('modify', onReinvite.bind(dialog, dialog)) ;

      // collect destination number and then outdial
      async.waterfall([collectNumber.bind(null, ep, dialog, req.msg.callingNumber), connectCaller], outdialCompleted) ;
    }) ;
  }) ;
} ;

function collectNumber(ep, dialog, ani, callback) {
  ep.playCollect({
    file: 'ivr/8000/ivr-please_enter_the_phone_number.wav',
    min: 10,
    max: 10,
    tries: 3,
    invalidFile: 'ivr/8000/ivr-invalid_number_format.wav',
    timeout: 8000,
    digitTimeout: 4000
  }, function(err, results) {
    if( err ) { return callback(err) ;}
    console.log('collected digits: %s', results.digits) ;
    callback(null, ep, dialog, ani, results.digits) ;
  });

}
function connectCaller(ep, dialog, ani, digits, callback) {
  srf.createUacDialog('sip:' + digits + '@' + gateway, {
    localSdp: dialog.remote.sdp,
    callingNumber: ani,
    headers: {
      'User-Agent': 'drachtio sample two-stage'
    }
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
  }) ;
}
function outdialCompleted(err, ep, dialog) {
  if( err ) {
    console.error('outdial failed with: ', err) ;

    ep.play(['ivr/8000/ivr-call_cannot_be_completed_as_dialed.wav'], function() {
      dialog.destroy() ;
      ep.destroy() ;
    }) ;
  }
}

// dialog event handlers
function onCallerHangup( ep, calledDialog ) {
  if( ep )  { ep.destroy() ; }
  if( calledDialog ) { calledDialog.destroy(); }
}
function onCalledPartyHangup( callerDialog ) {
  // hang up on caller
  callerDialog.destroy() ;
}
function onReinvite( dialog, req, res ) {
  console.log('got reINVITE from far end for dialog ', JSON.stringify(dialog)) ;
  res.send(200, {
    body: dialog.local.sdp
  }) ;
}
