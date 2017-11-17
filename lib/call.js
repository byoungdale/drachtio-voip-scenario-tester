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
  } // constructor

  /**
   * plays array of recordings the endpoint.
   * @param {undefined} undefined no paramters; only uses this.config and this.srf.
   * @returns {Promise} returns a Promise that resolves the InCall class.
   */
  receive() {
    return new Promise((resolve, reject) => {
      this.srf.invite((req, res) => {
        this.connect(req, res)
          .then((ep, dialog) => {
            const incall = new InCall(ep, dialog);
            resolve(incall);
          })
          .catch((err) => { reject(err); });
      }); // srf.invite
    }); // Promise
  } // receive

  /**
   * plays array of recordings the endpoint.
   * @param {string} digits digits to call (i.e. phone numbers, user, username, etc.).
   * @param {object} user object contains information on the user sending the call.
   * @returns {class} InCall is returned for in call functions.
   */
  send(digits, user) {
    return new Promise((resolve, reject) => {
      this.getEndpoint(user).then((ep) => {
        this.srf.createUacDialog(`sip:${digits}@${user.domain}`, {
          localSdp: ep.local.sdp,
          headers: {
            Contact: `sip:${user.username}@${user.domain}:${user.hostport}`,
            From: `sip:${user.username}@${user.domain}`,
            'User-Agent': 'drachtio sip tester',
          },
          auth: {
            username: user.username,
            password: user.password,
          },
        }, (err, dialog) => {
          if (err) { reject(err); }
          const incall = new InCall(ep, dialog);
          resolve(incall);
        }); // srf.createUacDialog
      }); // getEndpoint
    }); // Promise
  } // send
}; // Call
