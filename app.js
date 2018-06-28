'use strict';

const drachtio = require('drachtio');
const Mrf = require('drachtio-fsmrf');
const Srf = require('drachtio-srf');
const MediaServices = require('./lib/media-services');
const debug = require('debug');
const winston = require('winston');
const config = require('./config');
const scenario = require('./lib/scenario');

const {
  users,
  scenarios,
} = require('./config.js');

const logger = new winston.Logger({
  transports: [
    new winston.transports.File(config.logSettings),
  ],
  exitOnError: false,
});

const srf = new Srf();

const mrf = new Mrf(srf);

srf.connect(config.drachtioConnectOpts);

mrf.connect(config.mediaserverConnectOpts)
  .then((mediaserver) => {
    logger.info('successfully connected to medaiserver');
    MediaServices.MediaResources.addMediaServer(mediaserver);
  })
  .catch((error) => {
    logger.error(`could not conenct to mediaserver: ${error}`);
  });

srf.on('connect', (err, hostport) => {
  logger.info(`connected to drachtio listening for SIP on ${hostport}`);
  scenario.run(srf, users, scenarios.one, logger);
  setTimeout(() => { scenario.run(srf, users, scenarios.two, logger); }, 10000);
  // setTimeout(() => { scenario.run(srf, users, scenarios.three, logger); }, 20000);
  // setTimeout(() => { scenario.run(srf, users, scenarios.four, logger); }, 30000);
});

srf.on('cdr:attempt', (source, time, msg) => {
  logger.info(`${msg.get('Call-Id')}: got attempt record from ${source} at ${time}`);
  logger.debug(msg.raw);
  // source: 'network' or 'application'
  // time: UTC time message was sent or received by server
  // msg: object representing INVITE message that was sent or recieved
});

srf.on('cdr:start', (source, time, role, msg) => {
  logger.info(`${msg.get('Call-Id')}: got start record from ${source} at ${time} with role ${role}`);
  logger.debug(msg.raw);
  // role: 'uac', 'uas', 'uac-proxy', or 'uas-proxy'
  // msg: object representing 200 OK that was sent or received
});

srf.on('cdr:stop', (source, time, reason, msg) => {
  logger.info(`${msg.get('Call-Id')}: got end record from ${source} at ${time} with reason ${reason}`);
  logger.debug(msg.raw);
  // reason: reason the call was ended:
  //      'call-rejected', 'call-canceled', 'normal-release', 'session-expired',
  //      'system-initiated-termination', or 'system-error-initiated-termination'
  // msg: object representing BYE message that was sent or received
});
