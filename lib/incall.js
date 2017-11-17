
/**
 * handles the in call functions
 * @param {object} ep endpoint for the call.
 * @param {object} dialog dialog that the in call functions will run in.
 * @returns {undefined} returns back to call.
 */
module.exports = class InCall {
  /**
   * construction for the InCall class
   * @param {object} ep endpoint for the call.
   * @param {object} dialog dialog that the in call functions will run in.
   * @returns {undefined} returns back to call.
   */
  constructor(ep, dialog) {
    this.ep = ep;
    this.dialog = dialog;
  }

  /**
   * plays array of recordings the endpoint.
   * @param {array} recordings array of recordings files.
   * @returns {Promise} returns a Promise.
   */
  playRecording(recordings) {
    return new Promise((resolve, reject) => {
      this.ep.play(recordings, (err) => {
        if (err) { reject(err); }
        resolve();
      }); // ep.play
    }); // Promise
  } // playRecording

  /**
   * Send DTMF digits on the endpoint.
   * @param {string} digits a literal string of defined digits.
   * @returns {Promise} returns a Promise.
   */
  sendDTMF(digits) {
    return new Promise((resolve, reject) => {
      this.ep.getChannelVariables(false, (channel) => {
        const uuid = channel['Channel-Call-UUID'];
        this.ep.api('uuid_send_dtmf', [uuid, digits.toString()], (err) => {
          if (err) { reject(err); }
          resolve();
        }); // ep.api
      }); // ep.getChannelVariables
    }); // Promise
  } // sendDTMF

  /**
   * Puts a call on hold or off hold.
   * @param {bolean} holdBoolean true puts the call on hold false puts off hold.
   * @returns {Promise} returns a Promise.
   */
  modifyCall(holdBoolean) {
    return new Promise((resolve, reject) => {
      if (holdBoolean) {
        this.dialog.modify('hold', (err) => {
          if (err) { reject(err); }
          resolve();
        });
      } else {
        this.dialog.modify('unhold', (err) => {
          if (err) { reject(err); }
          resolve();
        });
      }
    }); // Promise
  } // modifyCall

  /**
   * Transfers a call from the referee to the referer on the specified domain.
   * @param {string} referer the SIP user transferring the call.
   * @param {string} referee the SIP user the call will be transfered to.
   * @param {string} domain the SIP domain where the referee is.
   * @returns {Promise} returns a Promise.
   */
  transfer(referer, referee, domain) {
    return new Promise((resolve, reject) => {
      this.dialog.request({
        method: 'REFER',
        headers: {
          'Refer-To': `${referee}@${domain}`,
          'Refered-By': `${referer}@${domain}`,
        },
      }, (err) => {
        if (err) { reject(err); }
        resolve();
      }); // dialog.request
    }); // Promise
  } // transfer

  /**
   * Ends the call by destroying the endpoint and the dialog.
   * @param {undefined} no parameters for this function.
   * @returns {undefined} returns back to call.
   */
  end() {
    if (this.ep) { this.ep.destroy(); }
    this.dialog.destroy();
  } // end
}; // class InCall
