// verify statusCode is success
// 200 <= Number(statusCode) && 300 > Number(statusCode)
const http = require('http');
const https = require('https');
const { HTTP_METHODS } = require('../domains');

