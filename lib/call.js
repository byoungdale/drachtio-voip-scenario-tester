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
  constructor(user, srf, logger) {
    this.user = user;
    this.srf = srf;
    this.logger = logger;

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
        this.debug('Could not create media server');
        return res.send(480);
      } // check for media servers
      this.debug('Created mediaServer');

      ms.connectCaller(req, res, (err, ep, dialog) => {
        if (err) { reject(err); }
        this.debug('created UAC dialog');
        res.send(200, { body: ep.local.sdp }, () => resolve(ep, dialog)); // res.send
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
      this.debug(`Created mediaServer: ${JSON.stringify(ms)}`);

      ms.createEndpoint({
        remoteSdp: user.sdp,
        codecs: ['PCMU', 'PCMA'],
      }, (err, ep) => {
        if (err) { reject(err); }
        this.debug(`Created endpoint: ${JSON.stringify(ep)}`);
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
          this.debug(`forwarding call to ${toContactUri} with a 302 Redirect`);
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
   * receives a call to the drachtio server.
   * @param {object} parameters optional object { forward: uri }.
   * @returns {Promise} returns a Promise that resolves the InCall class.
   */
  receive(parameters) {
    return new Promise((resolve, reject) => {
      // if parameter is null then just connect to this.user
      if (parameters === null) {
        this.srf.invite((req, res) => {
          this.debug('received an INVITE');
          this.connect(req, res)
            .then((ep, dialog) => {
              this.debug('created UAC dialog in received call');
              const incall = new InCall(ep, dialog, this.logger);
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
   * sends a call to the digits given in the first argument.
   * @param {string} digits digits to call (i.e. phone numbers, user, username, etc.).
   * @returns {class} InCall is returned for in call functions.
  */
  send(digits) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.getEndpoint(this.user).then((ep) => {
          this.srf.createUAC(`sip:${digits}@${this.user.domain}`, {
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
          }
          )
          .then((dialog) => {
            this.debug(`created UAC dialog on sent call: ${JSON.stringify(dialog)}`);
            const incall = new InCall(ep, dialog, this.logger);
            resolve(incall);
          })
          .catch((error) => {
            this.debug(error);
            reject(error);
          });
        }); // getEndpoint
      }, 500); // setTimeout
    }); // Promise
  } // send
}; // Call
