const { assert } = require('chai');
const httpModule = require('../../../src/modules/http');
const http = require('http');

describe('HTTP Module Tests', () => {
  it('generates http module executing request with all method from node core http package', () => {
    const formattedMethods = http.METHODS.map(method => method.toLowerCase().replace('-', '_'));

    assert.hasAnyDeepKeys(httpModule, formattedMethods);
  });
});