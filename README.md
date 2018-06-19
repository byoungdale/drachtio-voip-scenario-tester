# drachtio-voip-scenario-tester
A VoIP scenario tester built on the drachtio framework using [drachtio-srf](https://github.com/davehorton/drachtio-srf) and [drachtio-fsmrf](https://github.com/davehorton/drachtio-fsmrf).  

The main goal is to be able to create JSON-ish dialplans and have the application handle all the scenarios (inbound and outbound). Ideally, it could be integrated into a CI/CD workflow for easy testing in VoIP infrastructure development.

### call methods

##### receive
  - receives an incoming call
  - optional parameter: forward

##### send
  - makes an outbound call

### in-call methods

The InCall class has the following methods. The Call method resolves to a InCall instance that is used to call the methods.

##### sendDTMF
  - send DTMF

##### playRecording
  - play recording(s) from an endpoint
  
##### transfer
  - transfer a call

##### modifyCall
  - hold or unhold (callbacks currently not working for this function)

##### onReinvite
  - update SDP for re-invite
  
##### verifyMedia
  - verifies that media is flowing in the call

### endpoint registration

Endpoint registration is handled in the scenario run function, but you can use the registrationHandler yourself to handle it yourself.

##### register
  - register user
  
##### reRegister
  - re-register user at the expires interval

##### unregister
  - unregister user (set with timeout on 200 response to register)

### scenario functions

##### registerUsers
  - loops through the users object in the config file and registers them all to the domain
  
##### runScenario
  - loops through the given scenario object and runs the commands

##### run
  - just runs the two functions above

The magic happens in scenario.js where it loops through the scenarios defined in the config.js file.

##### example scenarios from config.js
```javacript
const scenarios = {
  one: {
    user: users.one,
    callflow: {
      direction: 'receive',
      parameters: null,
    },
    actions: [
      { playRecording: ['music/8000/suite-espanola-op-47-leyenda.wav'] },
    ],
  },
  two: {
    user: users.two,
    callflow: {
      direction: 'send',
      parameters: `${users.three.username}`,
    },
    actions: [
      { playRecording: ['ivr/8000/ivr-oh_whatever.wav'] },
      { transfer: [users.one.username, '1000', users.one.domain] },
    ],
  },
  three: {
    user: users.three,
    callflow: {
      direction: 'receive',
      parameters: { forward: `${users.one.username}@${users.one.domain}` },
    },
  },
};
```

Note: In order to run this application, you must have the following:
* [drachtio-server](https://github.com/davehorton/drachtio-server) running locally and listening on port 8022
* freeswitch running locally, listening for event socket on port 8021, and configured as per [drachtio-fs-ansible](https://github.com/byoungdale/drachtio-fs-ansible)
