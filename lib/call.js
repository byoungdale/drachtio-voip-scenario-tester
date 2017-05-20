// const async = require('async');
const MediaServices = require('./media-services');
const incall = require('./incall');

module.exports = class Call {
  constructor(opts, srf) {
    this.opts = opts;
    this.srf = srf;
  }

  receive(opts, srf) {
    return new Promise((resolve, reject) => {
      srf.invite((req, res) => {
        var result = {
          req: req,
          res: res,
          opts: opts
        };
        resolve(result);
      }); // srf.invite
    }); // new Promise
  }; // receive

  send(srf, ep, digits, opts) {
    return new Promise ((resolve, reject) => {
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
          var result = {
            ep: ep,
            dialog: dialog,
            err: err
          };
          resolve(result);
        }); // srf.createUacDialog
      }); // new Promise
    }; // send

  connect(req, res, opts) {
    return new Promise ((resolve, reject) => {
      // get a media server to connect to
      var ms = MediaServices.MediaResources.getMediaServer();
      if (!ms) {
        console.log(`no ms. Sending 480`);
        return res.send(480);
      } // check for media servers

      ms.connectCaller(req, res, (err, ep, dialog) => {
        if (err) { throw err; }
        res.send(200, { body: ep.local.sdp }, () => {
          var result = {
            ep: ep,
            dialog: dialog
          };
          resolve(result);
        }); // res.send
      }); // ms.connectCaller
    }); // new Promise
  }// connect

  getEndpoint(opts) {
    return new Promise ((resolve, reject) => {
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
        var result = {
          ep: ep
        }
        resolve(result);
      }); // ms.createEndpoint
    }); // new Promise
  } // getEndpoint

} // class Call
