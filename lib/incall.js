
const sendDTMF = (ep, dialog, digits, callback) => {
  ep.getChannelVariables(false, (channel) => {
    const uuid = channel['Channel-Call-UUID'];
    ep.api('uuid_send_dtmf', [uuid, digits.toString()], (err, results) => {
      if (err) { return err; }
      callback(ep, dialog)
    }); // ep.api
  }); // ep.getChannelVariables
}; // sendDTMF

const playRecording = (ep, dialog, recording, callback) => {
  ep.play(recording, (err, result) => {
    if (err) { return err; }
    callback();
  }); // ep.play
}; // playRecording

const end = (ep, dialog, callback) => {
  console.log(`destroying the dialog`);
  if (ep)  { ep.destroy(); }
  dialog.destroy((ep, dialog) => { console.log('ended call'); });
}; // end

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

module.exports.playRecording = playRecording;
module.exports.sendDTMF = sendDTMF;
module.exports.onReinvite = onReinvite;
module.exports.end = end;
module.exports.onCalledPartyHangup = onCalledPartyHangup;
module.exports.modifyCall = modifyCall;
