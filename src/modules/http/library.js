const http = require('http');
const https = require('https');
const queryStringModule = require('querystring');
const MESSAGES = require('../../application/messages');

const getResponseDefaultValues = (response) => {
  return {
    statusCode: response.statusCode,
    headers: response.headers,
    url: response.req.options.href,
    hostname: response.req.options.hostname,
    queryString: response.req.options.queryString,
  };
};

/**
 * 
 * @param {string} data stringfied data to be parsed 
 * @param {object} response HTTP response
 * @param {boolean} hasResponse flags if response should be returned
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
 * @param {stirng} url URL to be requested
 * @param {object} options options for the request
 * @param {string} method request method
 */
const executeRequest = (rawUrl, options = {}, method) => new Promise((resolve, reject) => {
  if (!isValidUrl(rawUrl)) reject(MESSAGES.http.executeRequest.invalidUrl);
  if (!isValidHttpMethod(method)) reject(MESSAGES.http.executeRequest.invalidMethod);

  const httpModule = getHttpModule(rawUrl);
  const url = buildUrlWithOptions(rawUrl, options.params, options.queryString);

  return httpModule[method.toLowerCase()](url, options, (response) => {
    let data = '';

    const { statusCode } = response;

    if (!isSucessStatusCode(statusCode)) reject(MESSAGES.http.executeRequest.statusCodeError);

    response.on('data', (chunk) => data = `${data}${chunk}`);
    response.on('end', () => resolve(buildResponse({ data, options, response })));
  }).on('error', (error) => reject(error.message));
});

/**
 * @param {string} url url to be validated 
 */
const isValidUrl = (url) => {
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
const isSucessStatusCode = (statusCode) => 200 <= Number(statusCode)
  && Number(statusCode) <= 299;

/**
 * @param {stirng} url url to be validated if contains http:// 
 */
const getHttpModule = (url) => {
  if (url.indexOf('http://') !== -1) return http;

  return https;
};

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

// const resolveResponse = (response)

module.exports = {
  executeRequest,
  isValidUrl,
  isValidHttpMethod,
  isSucessStatusCode,
  getHttpModule,
  buildUrlWithOptions,
};