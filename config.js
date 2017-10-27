const os = require('os');
const sdp = require('./lib/produceSdp');

const ipAddress = os.networkInterfaces().eth1[0].address;
const localSdp = sdp.produceSdp(ipAddress);

const user_1 = {
  domain: ipAddress,
  username: 1001,
  password: '1234',
  hostport: 5060,
  localAddress: ipAddress,
  sdp: localSdp,
};

const user_2 = {
  domain: ipAddress,
  username: 1002,
  password: '1234',
  hostport: 5060,
  localAddress: ipAddress,
  sdp: localSdp,
};

const drachtioConnectOpts = {
  host: 'localhost',
  port: 8022,
  secret: 'cymru',
};

const mediaserverConnectOpts = {
  address: '127.0.0.1',
  port: 8021,
  secret: 'ClueCon',
  listenAddress: '127.0.0.1',
  listenPort: 8081,
};

module.exports.user = user;
module.exports.drachtioConnectOpts = drachtioConnectOpts;
module.exports.mediaserverConnectOpts = mediaserverConnectOpts;
