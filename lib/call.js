// const async = require('async');
const MediaServices = require('./media-services');

const connect = (req, res, opts, callback) => {
  // get a media server to connect to
  const ms = MediaServices.MediaResources.getMediaServer();
  if (!ms) {
    return res.send(480);
  } // check for media servers

  ms.connectCaller(req, res, (err, ep, dialog) => {
    if (err) { throw err; }
    res.send(200, { body: ep.local.sdp }, () => {
      callback(ep, dialog);
    }); // res.send
  }); // ms.connectCaller
}; // connect

const getEndpoint = (opts, callback) => {
  const ms = MediaServices.MediaResources.getMediaServer();
  if (!ms) {
    return res.send(480);
  } // check for media servers

  ms.createEndpoint({
    remoteSdp: opts.sdp,
    codecs: ['PCMU', 'PCMA'],
  }, (err, ep) => {
    if (err) { throw err; }
    return callback(ep);
  }); // ms.createEndpoint
}; // getEndpoint

const receive = (srf, opts, callback) => {
  srf.invite((req, res) => {
    connect(req, res, opts, callback);
  }); // srf.invite
}; // receive

const send = (srf, digits, opts, callback) => {
  getEndpoint(opts, (ep) => {
    srf.createUacDialog(`sip:${digits}@${opts.domain}`, {
      localSdp: ep.local.sdp,
      headers: {
        Contact: `sip:${opts.username}@${opts.domain}:${opts.hostport}`,
        From: `sip:${opts.username}@${opts.domain}`,
        'User-Agent': 'drachtio sip tester',
      },
      auth: {
        username: opts.username,
        password: opts.password,
      },
    }, (err, dialog) => {
      if (err) { throw err; }
      callback(err, ep, dialog);
    }); // srf.createUacDialog
  }); // getEndpoint
}; // send

module.exports.receive = receive;
module.exports.send = send;
