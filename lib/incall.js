
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

module.exports.playRecording = playRecording;
module.exports.sendDTMF = sendDTMF;
module.exports.onReinvite = onReinvite;
module.exports.onCalledPartyHangup = onCalledPartyHangup;
module.exports.modifyCall = modifyCall;
