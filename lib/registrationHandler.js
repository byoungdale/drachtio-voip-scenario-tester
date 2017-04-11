'use strict' ;

const async = require('async') ;

const register = ( opts, srf, callback ) => {
  srf.request(`sip:${opts.user}@${opts.domain}`, {
      method: 'REGISTER',
      headers: {
          'Expires': '3600',
          'From': `sip:${opts.user}@${opts.domain}`,
          'Contact': `sip:${opts.user}@${opts.domain}:${opts.hostport}`
      },
      auth: {
        username: opts.user,
        password: opts.password
      }
  }, function(err, req){
      if( err ) {
        return err ;
      }
      req.on('response', function(res) {
          if( 200 !== res.status) {
            console.log(`Error registering ${res.status}`);
          } else if (200 == res.status) {
            console.log(res.headers);
            var expiresPosition = res.headers.contact.search("expires=");
            var headerLength = res.headers.contact.length;
            var expires = res.headers.contact.substring(expiresPosition+8, headerLength);
            //callback(opts, srf, expires);

            // wrapping the callback in setInterval allows the user to stay registered
            // based on the expires header in the 200 OK response from the registrar
            var reregister = setInterval(() => { callback( opts, srf, expires); }, expires*1000, opts, srf, expires);
            setTimeout(() => { unregister(opts, srf, reregister) }, 135000, opts, srf);
          }
      }) ;
  }) ;
} // register

const unregister = ( opts, srf, reregister ) => {
  console.log(`unregistering`);
  srf.request(`sip:${opts.user}@${opts.domain}`, {
      method: 'REGISTER',
      headers: {
          'Expires': '0',
          'From': `sip:${opts.user}@${opts.domain}`,
          'Contact': `sip:${opts.user}@${opts.domain}:${opts.hostport}`
      },
      auth: {
        username: opts.user,
        password: opts.password
      }
  }, function(err, req){
      if( err ) {
        return err ;
      }
      req.on('response', function(res) {
          if( 200 !== res.status) {
            console.log(`Error registering ${res.status}`);
          } else if (200 == res.status) {
            clearInterval(reregister);
          }
      }) ;
  }) ;
} // unregister


module.exports.register = register;
module.exports.unregister = unregister;
