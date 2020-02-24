const http = require('http');
const https = require('https');
const queryStringModule = require('querystring');
const MESSAGES = require('../../application/messages');

/**
 * @param {string} url url to be validated
 */
const isValidUrl = (url) => {
  // eslint-disable-next-line no-useless-escape
  const validation = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/);

  return validation.test(url);
};

/**
 * @param {string} method HTTP method to be validated
 */
const isValidHttpMethod = (method) => http.METHODS.includes(method.toUpperCase());

/**
 * @param {number} statusCode HTTP status code to be validated
 */
const isSucessStatusCode = (statusCode) => Number(statusCode) >= 200
  && Number(statusCode) <= 299;

/**
 * @param {string} url url to be validated if contains http://
 */
const getHttpModule = (url) => {
  if (url.indexOf('http://') !== -1) return http;

  return https;
};

/**
 *
 * @param {string} url url to be used and formatted with query string and/or params
 * @param {object} params object containing query params ordered as it'd be used
 * @param {object} queryString object container query strings
 */
const buildUrlWithOptions = (url = '', params, queryString) => {
  const separator = url[url.length - 1] === '/' ? '' : '/';
  let newUrl = `${url}${separator}`;

  if (params) {
    Object.keys(params).forEach((key) => {
      newUrl = `${newUrl}${params[key]}/`;
    });
  }

  if (queryString) newUrl = `${newUrl}?${queryStringModule.encode(queryString)}`;

  return newUrl;
};

/**
 *
 * @param {Response} response HTTP(S) core module Response<>
 */
const getResponseDefaultValues = (response) => ({
  headers: response.headers,
  host: response.client.servername,
  method: response.req.method,
  path: response.req.path,
  statusCode: response.statusCode,
});

/**
 *
 * @param {string} data stringfied data to be parsed
 * @param {object} response HTTP response
 */
const buildResponse = ({ data, options, response }) => {
  const preparedResponse = {
    body: JSON.parse(data),
    ...getResponseDefaultValues(response),
  };

  if (options.hasResponse) preparedResponse.response = response;

  return preparedResponse;
};

/**
 * @param {string} url URL to be requested
 * @param {object} options options for the request
 * @param {string} method request method
 */
const executeRequest = (url, options = {}, method) => new Promise((resolve, reject) => {
  if (!isValidUrl(url)) reject(MESSAGES.http.executeRequest.invalidUrl);
  if (!isValidHttpMethod(method)) reject(MESSAGES.http.executeRequest.invalidMethod);

  const httpModule = getHttpModule(url);
  const preparedUrl = buildUrlWithOptions(url, options.params, options.queryString);
  const preparedOptions = { ...options, method };

  return httpModule.request(preparedUrl, preparedOptions, (response) => {
    let data = '';

    const { statusCode } = response;

    if (!isSucessStatusCode(statusCode)) reject(MESSAGES.http.executeRequest.statusCodeError);

    response.on('data', (chunk) => {
      data = `${data}${chunk}`;
    });

    response.on('end', () => resolve(buildResponse({ data, options, response })));
  }).on('error', (error) => reject(error.message));
});

module.exports = {
  executeRequest,
  isValidUrl,
  isValidHttpMethod,
  isSucessStatusCode,
  getHttpModule,
  buildUrlWithOptions,
};
