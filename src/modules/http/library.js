const http = require('http');
const https = require('https');
const queryStringModule = require('querystring');
const MESSAGES = require('../../application/messages');

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

  return httpModule[method.toLowerCase()](url, preparedOptions, (response) => {
    let data = '';

    const { statusCode } = response;

    if (!isSucessStatusCode(statusCode)) reject(MESSAGES.http.executeRequest.statusCodeError);

    response.on('data', (chunk) => data = `${data}${chunk}`);
    response.on('end', () => resolve({ data: JSON.parse(data) }));
  }).on('error', (error) => reject(error.message));
});

/**
 * @param {string} url url to be validated 
 */
const isValidUrl = (url) => {};

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
  const separator = url[url.length + 1] === '/' ? '' : '/';
  let newUrl = `${url}${separator}`;

  if (params) {
    Object.keys(params).forEach((key) => {
      newUrl = `${newUrl}/${params[key]}`
    });
  }

  if (queryString) newUrl = `${newUrl}?${queryStringModule.encode(queryStringModule)}`;

  return newUrl;
};

const resolveResponse = (response)