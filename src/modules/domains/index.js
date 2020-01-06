const http = require('http');

const getHttpMethods = () => {
  const httpMethods = {};

  http.METHODS.forEach((method) => {
    httpMethods[method.toLowerCase()] = method;
  });

  return httpMethods;
};

module.exports = {
  HTTP_METHODS: getHttpMethods(),
};
