const faker = require('faker');
const { assert } = require('chai');
const http = require('http');
const nock = require('nock');
const httpModule = require('../../../src/modules/http');
const MESSAGES = require('../../../src/application/messages');

describe('HTTP Module Tests', () => {
  it('generates http module executing request with all method from node core http package', () => {
    const formattedMethods = http.METHODS.map((method) => method.toLowerCase().replace('-', '_'));

    assert.hasAnyDeepKeys(httpModule, formattedMethods);
  });

  describe('executeRequest()', () => {
    const basePath = 'https://google.com';
    const generateRandomObject = () => ({ [faker.random.uuid()]: faker.random.words() });

    describe('when input is valid', () => {
      it('resolves promise with formatted http request response', async () => {
        try {
          const responseBody = generateRandomObject();
          const statusCode = 200;

          nock(basePath)
            .get('/')
            .query(true)
            .reply(statusCode, responseBody);

          const response = await httpModule.get(`${basePath}/`, {});

          assert.hasAnyDeepKeys(response, ['body', 'headers', 'host', 'method', 'path', 'statusCode']);
          assert.deepEqual(response.body, responseBody);
          assert.deepEqual(response.statusCode, statusCode);
        } catch (error) {
          throw new Error(error);
        }
      });
    });
    describe('when input is invalid', () => {
      it('rejects promise with error when url given is invalid', async () => {
        try {
          await httpModule.get(`${faker.random.word()}/`, {});
        } catch (error) {
          assert.deepEqual(error, MESSAGES.http.executeRequest.invalidUrl);
        }
      });
    });
  });
});
