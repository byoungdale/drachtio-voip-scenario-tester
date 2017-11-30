/* jshint latedef:nofunc */
const MediaServices = require('./media-services');
const InCall = require('./incall');
/**
 * handles sending and receiving calls.
 * @param {object} user contains user information.
 * @param {object} srf Drachtio Signaling Resource Framework object for SIP handling.
 * @returns {object} resolves objects representing the SIP endpoint and SIP dialog.
 */
module.exports = class Call {
  /**
   * constructs the main objects for the class.
   * @param {object} user contains user information for user sending or receivng the call.
   * @param {object} srf Drachtio Signaling Resource Framework object for SIP handling.
   * @returns {undefined} returns back to call.
   */
  constructor(user, srf) {
    this.user = user;
    this.srf = srf;

    /**
     * connects an incoming call to an user.
     * @param {obejct} req request (INVITE) that came into the system for this user.
     * @param {object} res response to the INVITE that came in
     * @returns {Promise} returns a Promise that resolves with endpoint and dialog for the call.
     */
    this.connect = (req, res) => new Promise((resolve, reject) => {
      // get a media server to connect to
      const ms = MediaServices.MediaResources.getMediaServer();
      if (!ms) {
        return res.send(480);
      } // check for media servers

      ms.connectCaller(req, res, (err, ep, dialog) => {
        if (err) { reject(err); }
        res.send(200, { body: ep.local.sdp }, () => {
          resolve(ep, dialog);
        }); // res.send
      }); // ms.connectCaller
    }); // connect

    /**
     * connects an incoming call to an user.
     * @param {obejct} user user information for the user that will be sending the call.
     * @returns {Promise} returns a Promise that resolves with endpoint and dialog for the call.
     */
    this.getEndpoint = () => new Promise((resolve, reject) => {
      const ms = MediaServices.MediaResources.getMediaServer();
      if (!ms) {
        return res.send(480);
      } // check for media servers

      ms.createEndpoint({
        remoteSdp: user.sdp,
        codecs: ['PCMU', 'PCMA'],
      }, (err, ep) => {
        if (err) { reject(err); }
        resolve(ep);
      }); // ms.createEndpoint
    }); // getEndpoint

    /**
     * forwards/redirects the call to the given URI.
     * @param {string} toContactUri URI that the call will be redirected to.
     * @returns {Promise} Resolves back to the call.
     */
    this.forward = (toContactUri) => {
      return new Promise((resolve, reject) => {
        this.srf.invite((req, res) => {
          res.send(302, 'Redirect', {
            headers: {
              Contact: `${toContactUri}`,
            },
          }, (err) => {
            if (err) { reject(err); }
            resolve();
          }); // res.send
        }); // this.srf.invite
      }); // Promise
    }; // forward
  } // constructor

  /**
   * plays array of recordings the endpoint.
   * @param {object} parameters optional object { forward: uri }.
   * @returns {Promise} returns a Promise that resolves the InCall class.
   */
  receive(parameters) {
    return new Promise((resolve, reject) => {
      if (parameters === null) {
        this.srf.invite((req, res) => {
          this.connect(req, res)
            .then((ep, dialog) => {
              const incall = new InCall(ep, dialog);
              resolve(incall);
            })
            .catch((err) => { reject(err); });
        }); // srf.invite
      } else {
        const uri = parameters.forward;
        this.forward(uri);
      }
    }); // Promise
  } // receive

  /**
   * plays array of recordings the endpoint.
   * @param {string} digits digits to call (i.e. phone numbers, user, username, etc.).
   * @returns {class} InCall is returned for in call functions.
   */
  send(digits) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.getEndpoint(this.user).then((ep) => {
          this.srf.createUacDialog(`sip:${digits}@${this.user.domain}`, {
            localSdp: ep.local.sdp,
            headers: {
              Contact: `sip:${this.user.username}@${this.user.domain}:${this.user.hostport}`,
              From: `sip:${this.user.username}@${this.user.domain}`,
              'User-Agent': 'drachtio sip tester',
            },
            auth: {
              username: this.user.username,
              password: this.user.password,
            },
          }, (err, dialog) => {
            if (err) { reject(err); }
            const incall = new InCall(ep, dialog);
            resolve(incall);
          }); // srf.createUacDialog
        }); // getEndpoint
      }, 500); // setTimeout
    }); // Promise
  } // send
}; // Call
