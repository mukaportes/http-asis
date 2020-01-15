const { HTTP_METHODS } = require('../domains');
const { executeRequest } = require('./library');

const buildHttpModule = () => {
  const newModule = {};
  const httpMethodsKeys = Object.keys(HTTP_METHODS);

  httpMethodsKeys.forEach((method) => {
    newModule[method] = (url, options) => executeRequest(
      url, options, httpMethodsKeys[method],
    );
  });

  return newModule;
};

module.exports = buildHttpModule();
