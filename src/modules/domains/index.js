const http = require('http');

const getHttpMethods = () => {
  const httpMethods = {};

  http.METHODS.forEach((method) => {
    const formattedMethod = method.toLowerCase().replace('-', '_');

    httpMethods[formattedMethod] = method;
  });

  return httpMethods;
};

module.exports = {
  HTTP_METHODS: getHttpMethods(),
};
