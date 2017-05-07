// const async = require('async');
const MediaServices = require('./media-services');
const incall = require('./incall');

const receive = (opts, srf, callback) => {
  srf.invite((req, res) => {
    callback(req, res, opts);
  }); // srf.invite
}; // receive

const send = (srf, digits, opts, callback) => {
  var ms = MediaServices.MediaResources.getMediaServer();

  if (!ms) {
    console.log(`no ms. Can't create endpoint`);
  } // check for media servers

  const ep = getEndpoint(ms, opts);

  srf.createUacDialog(`sip:${digits}@${opts.domain}`, {
    localSdp: opts.localSdp,
    headers: {
      'User-Agent': 'drachtio sip tester',
    },
    auth: {
      username: opts.user,
      password: opts.password,
    }
  }, function (err, ep, dialog) {
      if (err) { throw err; }

      callback(err, ep, dialog);
    }); // srf.createUacDialog
}; // send

const connect = (req, res, opts, callback) => {
  // get a media server to connect to
  var ms = MediaServices.MediaResources.getMediaServer();
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
} // connect

const getEndpoint = (ms, opts) => {
  return ms.createEndpoint({
    remoteSdp: opts.localSdp,
    codecs: ['PCMU', 'PCMA', 'OPUS']
  }, (err, ep) => {
    if (err) {
      console.error(`Error creating UAC-facing endpoint:  ${err}`);
    }
  }); // ms.createEndpoint
}

module.exports.receive = receive;
module.exports.send = send;
module.exports.connect = connect;
