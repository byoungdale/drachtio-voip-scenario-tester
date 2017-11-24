const {
  register,
  reRegister,
} = require('./registrationHandler');
const Call = require('./call');

const runScenario = (srf, users, scenario, logger) => {
  Object.keys(users).forEach((user) => {
    register(user, srf, logger)
      .then((expires) => {
        reRegister(user, srf, expires, logger, () => {
          logger.info(`${user} is unregistered`);
        });
      })
      .catch((error) => {
        logger.debug(error);
      });
  });

  const call = new Call(scenario.user, srf);
  call[scenario.callflow]().then((incall) => {
    Object.keys(scenario.actions).forEach((action) => {
      logger.info(`running action: ${action}`);
      logger.info(`action paramters are: ${scenario.actions[action]}`);
      incall[action](scenario.actions[action])
        .then(() => { logger.info(`${action} resolved!`); })
        .catch((err) => {
          logger.debug(`${action} action hit an error`);
          logger.debug(err);
        });
    });
  });
}; // runScenario

const run = (srf, users, scenario, logger) => {
  runScenario(srf, users, scenario, logger);
}; // run

module.exports.run = run;
