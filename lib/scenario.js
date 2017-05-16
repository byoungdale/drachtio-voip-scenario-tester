// this will be where the Scenario class will be
// I will need to create instance of the Call, Registration, and InCall classes
// with the relevent scenario info
// Then running the scenario class will go through the defined scenario

module.exports = class Scenario {
  constructor(opts, srf) {
    this.opts = opts;
    this.srf = srf;
  }

// create instances of relevent Call, Registration, and InCall classes

  const call = new Call(config, srf);

  
}
