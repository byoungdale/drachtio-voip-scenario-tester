const produceSdp = (address) => {
  const sdp = ['v=0',
    `o=- 1111 0 IN IP4 ${address}`,
    's=drachtio session',
    `c=IN IP4 ${address}`,
    't=0 0',
    'm=audio 50000 RTP/AVP 0 9 113 101',
    'a=rtpmap:9 G722/8000',
    'a=rtpmap:113 opus/48000/2',
    'a=fmtp:113 useinbandfec=1',
    'a=rtpmap:101 telephone-event/8000',
    'a=fmtp:101 0-15',
    'a=inactive\r\n'];

  return sdp.join('\r\n');
};

module.exports.produceSdp = produceSdp;
