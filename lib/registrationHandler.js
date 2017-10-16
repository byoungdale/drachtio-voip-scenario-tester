'use strict';

const unregister = (config, srf, reregister) => {
  srf.request(`sip:${config.username}@${config.domain}`, {
    method: 'REGISTER',
    headers: {
      Expires: '0',
      From: `sip:${config.username}@${config.domain}`,
      Contact: `sip:${config.username}@${config.domain}:${config.hostport}`,
    },
    auth: {
      username: config.username,
      password: config.password,
    },
  }, (err, req) => {
    if (err) {
      return err;
    }
    req.on('response', (res) => {
      if (res.status !== 200) {
        throw err;
      } else if (res.status === 200) {
        clearInterval(reregister);
      }
    });
  });
}; // unregister

const register = (config, srf, callback) => {
  srf.request(`sip:${config.username}@${config.domain}`, {
    method: 'REGISTER',
    headers: {
      Expires: '3600',
      From: `sip:${config.username}@${config.domain}`,
      Contact: `sip:${config.username}@${config.domain}:5060`,
    },
    auth: {
      username: config.username,
      password: config.password,
    },
  }, (err, req) => {
    if (err) {
      return err;
    }
    req.on('response', (res) => {
      if (res.status === 200) {
        const expiresPosition = res.headers.contact.search('expires=');
        const headerLength = res.headers.contact.length;
        const expires = res.headers.contact.substring(expiresPosition + 8, headerLength);
        const reregister = setInterval(() => {
          callback(config, srf, expires);
        }, expires * 1000, config, srf, expires);
        // unregister after 50 seconds
        setTimeout(() => { unregister(config, srf, reregister); }, 500000, config, srf);
      }
    }); // req.on
  }); // srf.request
}; // register

const reRegister = (config, srf, expires) => {
  srf.request(`sip:${config.username}@${config.domain}`, {
    method: 'REGISTER',
    headers: {
      Expires: expires,
      From: `sip:${config.username}@${config.domain}`,
      Contact: `sip:${config.username}@${config.domain}:${config.hostport}`,
    },
    auth: {
      username: config.username,
      password: config.password,
    },
  });
}; // srf.request

module.exports.register = register;
module.exports.unregister = unregister;
module.exports.reRegister = reRegister;
