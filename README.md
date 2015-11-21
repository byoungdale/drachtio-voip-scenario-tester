# drachtio-sample-twostage-dialing
Sample two-stage dialing application built using [drachtio-srf](https://github.com/davehorton/drachtio-srf) and [drachtio-fsmrf](https://github.com/davehorton/drachtio-fsmrf).  

This application illustrates how to build a simple VoIP back-to-back user agent using the drachtio frameworks.

Note: In order to run this application, you must have the following:
* [drachtio-server](https://github.com/davehorton/drachtio-server) running locally and listening on port 8022
* freeswitch running locally, listening for event socket on port 8021, and configured as per [drachtio-fs-ansible](https://github.com/davehorton/drachtio-fs-ansible)
* a PSTN gateway (or device/phone to stand in), which you specify on the command line when running the app

Usage:
```bash
node index.js --gateway 10.128.22.88
```
Once the app has been started, dial into the server at port 5060 to interact with the IVR and outdial.