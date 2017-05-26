// this will be where the Scenario class will be
// I will need to create instance of the Call, Registration, and InCall classes
// with the relevent scenario info
// Then running the scenario class will go through the defined scenario
const config = require('./config');


module.exports = class Scenario {
  constructor(opts, srf) {
    this.opts = opts;
    this.srf = srf;
  }

// this class should create instances of relevent Call, Registration, and InCall classes

// this class should have a 'run' function that sets up
// async.series and async.waterfall
// and properly runs through call and incall functions defined in scenarioOpts

// this class should also automatically run registrationHandler for any
// defined users, so that the users are ready for calls
// OR define the registration process in the scenarioOpts file

  const call = new Call(config, srf);

  async.series(config.scenarioOpts);
}
