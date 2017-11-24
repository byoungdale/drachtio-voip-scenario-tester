# drachtio-sip-scenario-tester
A SIP scenario tester built on the drachtio framework using [drachtio-srf](https://github.com/davehorton/drachtio-srf) and [drachtio-fsmrf](https://github.com/davehorton/drachtio-fsmrf).  

### call methods

##### receive
  - receive a call

##### send
  - send a call

### in-call methods

The InCall class has the following methods. The Call method resolves to a InCall instance that is used to call the methods.

##### sendDTMF
  - send DTMF (callbacks currently not working for this function)

##### playRecording
  - play recording(s) from endpoint
  
##### transfer
  - transfer a call

##### modifyCall
  - hold or unhold (callbacks currently not working for this function)

##### onReinvite
  - update SDP for re-invite

### endpoint registration

Endpoint registration is handled in the scenario.js file, but you can use the registrationHandler yourself to handle it yourself.

##### .register
  - register user
  
##### reRegister
  - re-register user at the expires interval

##### unregister
  - unregister user (set with timeout on 200 response to register)

The magic happens in scenario.js where it loops through the scenarios defined in the config.js file.

##### example scenario from config.js
```javacript
const scenarios = {
  one: {
    callflow: 'receive',
    user: users.one,
    actions: {
      playRecording: [
        'misc/8000/we_are_trying_to_reach.wav',
        'digits/8000/1.wav',
        'digits/8000/thousand.wav',
        'digits/8000/2.wav',
      ],
      transfer: [users.one.username, '1002', users.one.domain],
    },
  },
  two: {
    callflow: 'send',
    user: users.two,
    actions: {
      playRecording: ['ivr/8000/ivr-oh_whatever.wav'],
    },
  },
};
```

Note: In order to run this application, you must have the following:
* [drachtio-server](https://github.com/davehorton/drachtio-server) running locally and listening on port 8022
* freeswitch running locally, listening for event socket on port 8021, and configured as per [drachtio-fs-ansible](https://github.com/byoungdale/drachtio-fs-ansible)
