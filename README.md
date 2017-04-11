# drachtio-sip-scenario-tester
A SIP tester, like SIPp and Star Trinity, built on the drachtio framework using [drachtio-srf](https://github.com/davehorton/drachtio-srf) and [drachtio-fsmrf](https://github.com/davehorton/drachtio-fsmrf).  

Note: In order to run this application, you must have the following:
* [drachtio-server](https://github.com/davehorton/drachtio-server) running locally and listening on port 8022
* freeswitch running locally, listening for event socket on port 8021, and configured as per [drachtio-fs-ansible](https://github.com/davehorton/drachtio-fs-ansible)
