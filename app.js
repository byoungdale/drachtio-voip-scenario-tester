'use strict';

const drachtio = require('drachtio');
const Mrf = require('drachtio-fsmrf');
const Srf = require('drachtio-srf');
const MediaServices = require('./lib/media-services');
const debug = require('debug');
const config = require('./config');
const scenario = require('./lib/scenario');

const app = drachtio();
const mrf = new Mrf(app);
const srf = new Srf(app);

srf.connect(config.drachtioConnectOpts);

mrf.connect(config.mediaserverConnectOpts, (ms) => {
  MediaServices.MediaResources.addMediaServer(ms);
});

srf.on('connect', (err, hostport) => {
  console.log('connected to drachtio listening for SIP on %s', hostport);
});

mrf.on('connect', (err, ms) => {
  if (err) { debug(err); }
  MediaServices.addMediaServer(ms);
});

scenario.run(config, srf);
