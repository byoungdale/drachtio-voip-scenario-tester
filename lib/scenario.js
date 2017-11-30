const async = require('async');

const {
  register,
  reRegister,
  unregister,
} = require('./registrationHandler');
const Call = require('./call');

const registerUsers = (srf, users, logger) => {
  Object.keys(users).forEach((key) => {
    register(users[key], srf)
      .then((expires) => {
        logger.info(`${users[key].username} is registered`);
        const reregisterInterval = setInterval(() => {
          reRegister(users[key], srf, expires, logger, () => {
            logger.info(`${users[key].username} reregistered`);
          });
        }, expires * 1000, users[key], srf, expires);
        setTimeout(() => {
          logger.info(`un-registering ${users[key].username}`);
          unregister(users[key], srf, reregisterInterval);
        }, 5000000, users[key], srf);
      })
      .catch((error) => {
        logger.debug(`error registering ${users[key].username}`);
        logger.debug(error);
      });
  });
}; // registerUsers

const runScenario = (srf, scenario, logger) => {
  const call = new Call(scenario.user, srf);
  call[scenario.callflow.direction](scenario.callflow.parameters).then((incall) => {
    logger.info(`Callflow direction is ${scenario.callflow.direction}`);
    let chain = Promise.resolve();
    for (const actionObject of scenario.actions) {
      const action = Object.keys(actionObject)[0];
      const actionParams = actionObject[action];
      chain = chain.then(() => {
        incall[action](actionParams)
          .then(() => {
            logger.info(`${scenario.callflow.direction} ${action} resolved!`);
          })
          .catch((error) => {
            logger.debug(`${scenario.callflow.direction} ${action} action hit an error`);
            logger.debug(error);
          });
      });
    }
  });
}; // runScenario

const run = (srf, users, scenario, logger) => {
  // register all users before running scenario
  registerUsers(srf, users, logger);
  runScenario(srf, scenario, logger);
}; // run

module.exports.run = run;
