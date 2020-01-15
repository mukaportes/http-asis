const domains = require('./src/modules/domains');
const http = require('./src/modules/http');
const httpLibrary = require('./src/modules/http/library');

module.exports = {
  domains,
  http,
  library: {
    http: httpLibrary,
  }
};
