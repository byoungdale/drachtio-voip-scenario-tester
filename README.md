# drachtio-sip-scenario-tester
A SIP tester, like SIPp and Star Trinity, built on the drachtio framework using [drachtio-srf](https://github.com/davehorton/drachtio-srf) and [drachtio-fsmrf](https://github.com/davehorton/drachtio-fsmrf).  

## call functions:
  ### call.receive
    - receive a call
  ### call.send
    - send a call

## in-call functions:
  ### incall.sendDTMF
    - send DTMF (callbacks currently not working for this function)
  ###incall.playRecording
    - play recording(s) from endpoint
  ### incall.modifyCall
    - hold or unhold (callbacks currently not working for this function)
  ### incall.onReinvite
    - update SDP for re-invite

## endpoint registration:
  ### registrationHandler.register
    - register user
  ### registrationHandler.unregister
    - unregister user (set with timeout on 200 response to register)

The magic happens in scenario.js where you place the in-call function in a async.series within the callback to call.receive or call.send. Take a look at the example scenario in /lib/scenario.js.

Note: In order to run this application, you must have the following:
* [drachtio-server](https://github.com/davehorton/drachtio-server) running locally and listening on port 8022
* freeswitch running locally, listening for event socket on port 8021, and configured as per [drachtio-fs-ansible](https://github.com/byoungdale/drachtio-fs-ansible)
