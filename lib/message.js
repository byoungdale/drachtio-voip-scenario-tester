// Adding messaging support
// potential methods: message.send, message.receive, message.mwi

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
     * receives mwi message from remote server and processes it.
     * @param {object} parameters optional object { forward: uri }.
     * @returns {Promise} returns a Promise that resolves the InCall class.
     */
    this.mwi = (parameters) => new Promise((resolve, reject) => {
      return;
    }); // Promise
  } // constructor

  /**
   * receives a call to the drachtio server.
   * @param {object} parameters optional object { forward: uri }.
   * @returns {Promise} returns a Promise that resolves the InCall class.
   */
  receive(parameters) {
    return new Promise((resolve, reject) => {
      this.srf.message((req, res) => {
        this.debug('Recevied a MESSAGE!');
        resolve('srf.message worked!');
      });
    }); // Promise
  } // receive

  send(digits) {
    return new Promise((resolve, reject) => {
      reject('do not use this yet');
    }); // Promise
  } // send
}; // Message
