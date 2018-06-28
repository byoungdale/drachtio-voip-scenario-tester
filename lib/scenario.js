const debug = require('debug');
const {
  register,
  reRegister,
  unregister,
} = require('./registrationHandler');
const Call = require('./call');

const registerUsers = (srf, users, logger) => {
  Object.keys(users).forEach((key) => {
    register(users[key], srf, logger)
      .then((expires) => {
        debug(`${users[key].username} is registered`);
        const reregisterInterval = setInterval(() => {
          reRegister(users[key], srf, expires, logger, () => {
            debug(`${users[key].username} reregistered`);
          });
        }, expires * 1000, users[key], srf, expires);
        setTimeout(() => {
          debug(`un-registering ${users[key].username}`);
          unregister(users[key], srf, reregisterInterval);
        }, 5000000, users[key], srf);
      })
      .catch((error) => {
        debug(`error registering ${users[key].username}`);
        debug(error);
      });
  });
}; // registerUsers

const runScenario = (srf, scenario, logger) => {
  const call = new Call(scenario.user, srf, logger);
  call[scenario.callflow.direction](scenario.callflow.parameters).then((incall) => {
    debug(`Callflow direction is ${scenario.callflow.direction}`);
    let chain = Promise.resolve();
    for (const actionObject of scenario.actions) {
      const action = Object.keys(actionObject)[0];
      const actionParams = actionObject[action];
      // chain Promises so they go one at a time
      chain = chain.then(() => {
        incall[action](actionParams)
          .then(() => {
            debug(`${scenario.callflow.direction} ${action} resolved!`);
          })
          .catch((error) => {
            debug(`${scenario.callflow.direction} ${action} action hit an error`);
            debug(error);
          });
      });
    }
  });
}; // runScenario

const run = (srf, users, scenario, logger) => {
  // register all users before running scenario
  registerUsers(srf, users, logger);

  // add for each scenario -> runScenario()
  runScenario(srf, scenario, logger);
}; // run

module.exports.run = run;
