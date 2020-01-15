const faker = require('faker');
const { assert } = require('chai');
const http = require('http');
const https = require('https');
const nock = require('nock');
const httpModule = require('../../../src/modules/http/library');
const { HTTP_METHODS } = require('../../../src/modules/domains');
const MESSAGES = require('../../../src/application/messages');

describe('HTTP Module Library Tests', () => {
  describe('isValidUrl()', () => {
    describe('success cases', () => {
      it('returns true when the url given is valid', () => {
        const inputUrl = faker.internet.url();
        const validation = httpModule.isValidUrl(inputUrl);

        assert.deepEqual(validation, true);
      });
    });
    describe('failure cases', () => {
      it('returns false when the url given is invalid', () => {
        const inputUrl = faker.random.word();
        const validation = httpModule.isValidUrl(inputUrl);

        assert.deepEqual(validation, false);
      });
    });
  });
  describe('isValidHttpMethod()', () => {
    describe('success cases', () => {
      it('returns true when the method given is valid', () => {
        const [method] = http.METHODS;
        const validation = httpModule.isValidHttpMethod(method);

        assert.deepEqual(validation, true);
      });
    });
    describe('failure cases', () => {
      it('returns false when the method given is invalid', () => {
        const method = faker.random.word();
        const validation = httpModule.isValidHttpMethod(method);

        assert.deepEqual(validation, false);
      });
    });
  });
  describe('isSucessStatusCode()', () => {
    describe('success cases', () => {
      it('returns true when the status code given is in between 200 and 299', () => {
        const statusCode = faker.random.number({ max: 299, min: 200 });
        const validation = httpModule.isSucessStatusCode(statusCode);

        assert.deepEqual(validation, true);
      });
    });
    describe('failure cases', () => {
      it('returns false when the status code given is NOT in between 200 and 299', () => {
        const statusCode = faker.random.number({ max: 100, min: 199 });
        const validation = httpModule.isSucessStatusCode(statusCode);

        assert.deepEqual(validation, false);
      });
    });
  });
  describe('getHttpModule()', () => {
    it('returns http node module when the url given contains http prefix', () => {
      const url = 'http://localhost:3000';

      assert.deepEqual(httpModule.getHttpModule(url), http);
    });
    it('returns https node module when the url given does not contain http prefix', () => {
      const url = 'localhost:3000';

      assert.deepEqual(httpModule.getHttpModule(url), https);
    });
  });
  describe('buildUrlWithOptions()', () => {
    it('returns only "/" separator when no url or options are given', () => {
      const url = httpModule.buildUrlWithOptions();
      const separator = '/';

      assert.deepEqual(url, separator);
    });
    it('returns raw url when no query string or param are given', () => {
      const inputUrl = `${faker.internet.url()}/`;
      const url = httpModule.buildUrlWithOptions(inputUrl, {});

      assert.deepEqual(url, inputUrl);
    });
    it('returns url with query params when no query string are given', () => {
      const inputUrl = `${faker.internet.url()}/`;
      const params = { test: 'ok' };

      const expectedUrl = `${inputUrl}${params.test}/`;

      const url = httpModule.buildUrlWithOptions(inputUrl, params);

      assert.deepEqual(url, expectedUrl);
    });
    it('returns url with query string when no query params are given', () => {
      const inputUrl = faker.internet.url();
      const propName = 'test';
      const queryString = { [propName]: 'ok' };

      const expectedUrl = `${inputUrl}/?${propName}=${queryString[propName]}`;

      const url = httpModule.buildUrlWithOptions(inputUrl, null, queryString);

      assert.deepEqual(url, expectedUrl);
    });
  });
  describe('executeRequest()', () => {
    let basePath = 'https://google.com';
    const generateRandomObject = () => ({ [faker.random.uuid()]: faker.random.words() });

    describe('when input is valid', () => {
      it('resolves promise with formatted http request response', async () => {
        try {
          const responseBody = generateRandomObject();
          const queryString = generateRandomObject();
          const statusCode = 200;

          nock(basePath)
            .get('/')
            .query(queryString)

            .reply(statusCode, responseBody)

          const response = await httpModule.executeRequest(
            `${basePath}/`, { queryString }, HTTP_METHODS.get,
          );

          assert.hasAnyDeepKeys(response, ['body', 'statusCode', 'headers', 'url', 'hostname', 'queryString']);
          assert.deepEqual(response.body, responseBody);
          assert.deepEqual(response.statusCode, statusCode);
          assert.deepEqual(response.queryString, queryString);
        } catch (error) {
          throw new Error(error);
        }
      });
      it('resolves promise with formatted http request response and the full response when flag hasResponse exists', async () => {
        try {
          const responseBody = generateRandomObject();
          const queryString = generateRandomObject();
          const statusCode = 200;

          nock(basePath)
            .get('/')
            .query(queryString)

            .reply(statusCode, responseBody)

          const response = await httpModule.executeRequest(
            `${basePath}/`, { queryString }, HTTP_METHODS.get,
          );

          assert.hasAnyDeepKeys(response, [
            'body', 'statusCode', 'headers', 'url', 'hostname', 'queryString', 'response',
          ]);
          assert.deepEqual(response.body, responseBody);
          assert.deepEqual(response.statusCode, statusCode);
          assert.deepEqual(response.queryString, queryString);
        } catch (error) {
          throw new Error(error);
        }
      });
    });
    describe('when input is invalid', () => {
      it('rejects promise with error when url given is invalid', async () => {
        try {
          await httpModule.executeRequest(
            `${faker.random.word()}/`, undefined, HTTP_METHODS.get,
          );
        } catch (error) {
          assert.deepEqual(error, MESSAGES.http.executeRequest.invalidUrl)
        }
      });
      it('rejects promise with error when response status code is not 2XX', async () => {
        try {
          const responseBody = generateRandomObject();
          const queryString = generateRandomObject();

          nock(basePath)
            .get('/')
            .query(queryString)

            .reply(400, responseBody)

          await httpModule.executeRequest(
            `${basePath}/`, { queryString, hasResponse: true }, HTTP_METHODS.get,
          );
        } catch (error) {
          assert.deepEqual(error, MESSAGES.http.executeRequest.statusCodeError)
        }
      });
      it('rejects promise with error when http method given is invalid', async () => {
        try {
          await httpModule.executeRequest(
            `${basePath}/`, {}, faker.name.findName(),
          );
        } catch (error) {
          assert.deepEqual(error, MESSAGES.http.executeRequest.invalidMethod)
        }
      });
    });
  });
});