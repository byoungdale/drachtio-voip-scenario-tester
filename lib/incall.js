
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

const onReinvite = (dialog, req, res) => {
  res.send(200, {
    body: dialog.local.sdp,
  }); // res.send
}; // onReinvite

module.exports.playRecording = playRecording;
module.exports.sendDTMF = sendDTMF;
module.exports.onReinvite = onReinvite;
module.exports.end = end;
