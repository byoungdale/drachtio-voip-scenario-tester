
const sendDTMF = (ep, dialog, digits, callback) => {
  ep.getChannelVariables(false, (channel) => {
    const uuid = channel['Channel-Call-UUID'];
    ep.api('uuid_send_dtmf', [uuid, digits.toString()], (err) => {
      if (err) { return err; }
      return callback();
    }); // ep.api
  }); // ep.getChannelVariables
}; // sendDTMF

const playRecording = (ep, dialog, recordings, callback) => {
  ep.play(recordings, (err) => {
    if (err) { return err; }
    return callback();
  }); // ep.play
}; // playRecording

const end = (ep, dialog) => {
  if (ep) { ep.destroy(); }
  dialog.destroy();
}; // end

/*
need to clean this up

if this function is run, modify state of callback
if on hold, go off hold. vice versa

*/
const modifyCall = (ep, dialog, holdBoolean, callback) => {
  if (holdBoolean === 'hold') {
    ep.modify('hold');
  } else {
    ep.modify('unhold');
  }
  callback();
};

const onReinvite = (dialog, req, res) => {
  res.send(200, {
    body: dialog.local.sdp,
  }); // res.send
}; // onReinvite

module.exports.playRecording = playRecording;
module.exports.sendDTMF = sendDTMF;
module.exports.onReinvite = onReinvite;
module.exports.end = end;
module.exports.modifyCall = modifyCall;
