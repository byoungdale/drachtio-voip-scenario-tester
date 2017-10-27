
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

const modifyCall = (ep, dialog, holdBoolean, callback) => {
  if (holdBoolean) {
    dialog.modify('hold', (err) => {
      if (err) { throw err; }
      return callback();
    });
  } else {
    dialog.modify('unhold', (err) => {
      if (err) { throw err; }
      return callback();
    });
  }
}; // modifyCall

const transfer = (ep, dialog, referee, referer, domain, callback) => {
  dialog.request({
    method: 'REFER',
    headers: {
      'Refer-To': `${referee}@${domain}`,
      'Refered-By': `${referer}@${domain}`,
    }
  }, (err, res) => {
    if (err) { return err; }
    console.log(`Response from transfer is ${JSON.stringify(res)}`)
    return callback();
  }); // dialog.request
} // transfer

const onReinvite = (dialog, req, res) => {
  res.send(200, {
    body: dialog.local.sdp,
  }); // res.send
}; // onReinvite

module.exports.playRecording = playRecording;
module.exports.sendDTMF = sendDTMF;
module.exports.onReinvite = onReinvite;
module.exports.modifyCall = modifyCall;
module.exports.transfer = transfer;
module.exports.end = end;
