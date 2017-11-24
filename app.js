'use strict';

const drachtio = require('drachtio');
const Mrf = require('drachtio-fsmrf');
const Srf = require('drachtio-srf');
const MediaServices = require('./lib/media-services');
const debug = require('debug');
const winston = require('winston');
const config = require('./config.js');
const scenario = require('./lib/scenario');

const { logSettings } = './config';
const {
  users,
  scenarios,
} = require('./config.js');

const app = drachtio();
const mrf = new Mrf(app);
const srf = new Srf(app);

const logger = winston.Logger({
  transports: [
    new winston.transports.File(logSettings),
  ],
  exitOnError: false,
});

srf.connect(config.drachtioConnectOpts);

mrf.connect(config.mediaserverConnectOpts, (ms) => {
  MediaServices.MediaResources.addMediaServer(ms);
});

srf.on('connect', (err, hostport) => {
  logger.info('connected to drachtio listening for SIP on %s', hostport);
});

mrf.on('connect', (err, ms) => {
  if (err) { debug(err); }
  MediaServices.addMediaServer(ms);
});

// make this method to register all users for the scenario
// registerUsers();
scenario.run(srf, users, scenarios.one, logger);
