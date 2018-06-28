
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
   * @param {array} recordings array of file paths to recording files.
   * @returns {Promise} returns a Promise.
   */
  playRecording(recordings) {
    return new Promise((resolve, reject) => {
      this.ep.play(recordings, (err) => {
        if (err) { reject(err); }
      }); // ep.play
      resolve(this.dialog);
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
          resolve(this.dialog);
        }); // ep.api
      }); // ep.getChannelVariables
    }); // Promise
  } // sendDTMF

  /**
   * Puts a call on hold or off hold.
   * @param {none} none checks the status of this.dialog.onHold.
   * @returns {Promise} returns a Promise.
   */
  modifyCall() {
    return new Promise((resolve, reject) => {
      if (!this.dialog.onHold) {
        this.dialog.modify('hold', (err) => {
          if (err) { reject(err); }
          resolve('placed call on hold');
        });
      } else {
        this.dialog.modify('unhold', (err) => {
          if (err) { reject(err); }
          resolve('took call off hold');
        });
      }
    }); // Promise
  } // modifyCall

  /**
   * Transfers a call from the referee to the referer on the specified domain.
   * @param {array} transferParams containing [referer, referee, domain]
   * @returns {Promise} returns a Promise.
   */
  transfer(transferParams) {
    const referer = transferParams[0];
    const referee = transferParams[1];
    const domain = transferParams[2];
    return new Promise((resolve, reject) => {
      this.dialog.request({
        method: 'REFER',
        headers: {
          'Refer-To': `${referee}@${domain}`,
          'Refered-By': `${referer}@${domain}`,
        },
      }, (err) => {
        if (err) { reject(err); }
        resolve(this.dialog);
      }); // dialog.request
    }); // Promise
  } // transfer

  /**
   * verifies that media is flowing in the call.
   * @param {undefined} no parameters for this function.
   * @returns {undefined} returns Promise.
   */
  verifyMedia() {
    return new Promise((resolve, reject) => {
      this.ep.getChannelVariables(true, (channelVariables) => {
        if (channelVariables.variable_rtp_audio_in_packet_count === 0
            && channelVariables.variable_rtp_audio_out_packet_count > 0) {
          resolve('NO MEDIA IN');
        } else if (channelVariables.variable_rtp_audio_in_packet_count > 0
          && channelVariables.variable_rtp_audio_out_packet_count === 0) {
          resolve('NO MEDIA OUT');
        } else if (channelVariables.variable_rtp_audio_in_packet_count === 0
          && channelVariables.variable_rtp_audio_out_packet_count === 0) {
          reject('NO MEDA IN OR OUT');
        }
        resolve('MEDIA FLOWING IN AND OUT');
      }); // this.ep.getChannelVariables
    }); // Promise
  } // verifyMedia

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
