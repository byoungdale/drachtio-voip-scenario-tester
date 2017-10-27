# drachtio-sip-scenario-tester
A SIP scenario tester built on the drachtio framework using [drachtio-srf](https://github.com/davehorton/drachtio-srf) and [drachtio-fsmrf](https://github.com/davehorton/drachtio-fsmrf).  

### call functions

##### receive
  - receive a call

##### send
  - send a call

### in-call functions

##### sendDTMF
  - send DTMF

##### playRecording
  - play recording(s) from endpoint

##### onReinvite
  - update SDP for re-invite
  
##### modifyCall
  - hold or unhold
  
##### transfer
  - transfer call with REFER method

### endpoint registration

##### register
  - register user

##### unregister
  - unregister user (set with timeout on 200 response to register)

##### reRegister
  - re-register user at a given interval in register function callback

The magic happens in scenario.js where you place the in-call function in a async.series within the callback to call.receive or call.send. Take a look at the example scenario in /lib/scenario.js.

run the scenario in app.js with the run method, passing in the config and srf (Signaling Resource Framework) parameters:

```javascript
scenario.run(config, srf);
```

Note: In order to run this application, you must have the following:
* [drachtio-server](https://github.com/davehorton/drachtio-server) running locally and listening on port 8022
* freeswitch running locally, listening for event socket on port 8021, and configured as per [drachtio-fs-ansible](https://github.com/byoungdale/drachtio-fs-ansible)
