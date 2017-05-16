// const async = require('async');
const MediaServices = require('./media-services');
const incall = require('./incall');

module.exports = class Call {
  constructor(opts, srf) {
    this.opts = opts;
    this.srf = srf;
  }

  receive(opts, srf, callback) {
    srf.invite((req, res) => {
      callback(req, res, opts);
    }); // srf.invite
  }; // receive

  send(srf, ep, digits, opts, callback) {
    srf.createUacDialog(`sip:${digits}@${opts.domain}`, {
      localSdp: ep.local.sdp,
      headers: {
        'Contact': `sip:${opts.user}@${opts.domain}:${opts.hostport}`,
        'From': `sip:${opts.user}@${opts.domain}`,
        'User-Agent': 'drachtio sip tester',
      },
      auth: {
        username: opts.username,
        password: opts.password
      }
    }, function (err, dialog) {
        if (err) { throw err; }

        callback(err, ep, dialog);
      }); // srf.createUacDialog
  }; // send

  connect(req, res, opts, callback) {
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

  getEndpoint(opts, callback) {
    var ms = MediaServices.MediaResources.getMediaServer();
    if (!ms) {
      console.log(`no ms. Sending 480`);
      return res.send(480);
    } // check for media servers

    ms.createEndpoint({
      remoteSdp: opts.localSdp,
      codecs: ['PCMU', 'PCMA', 'OPUS']
    }, (err, ep) => {
      if (err) { throw err; }
      callback(ep);
    }); // ms.createEndpoint
  } // getEndpoint

} // class Call
