const request = require('./src/modules/http');
const httpLibrary = require('./src/modules/http/library');

module.exports = {
  request,
  library: {
    http: httpLibrary,
  },
};
