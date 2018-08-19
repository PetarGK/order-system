'use strict';

const APP_ROOT = '../../';

const _       = require('lodash');
const Promise = require("bluebird");

let viaHandler = (event, functionName) => {  
    let handler = require(`${APP_ROOT}/functions/${functionName}`).handler;
    console.log(`invoking via handler function ${functionName}`);
  
    return new Promise((resolve, reject) => {
      let context = {};
      let callback = function (err, response) {
        if (err) {
          reject(err);
        } else {
          let contentType = _.get(response, 'headers.content-type', 'application/json');
          if (response.body && contentType === 'application/json') {
            response.body = JSON.parse(response.body);
          }
  
          resolve(response);
        }
      };
  
      handler(event, context, callback);
    });
}

let we_invoke_get_hello = async function () {
    let res = await viaHandler({}, 'get-hello');
  
    return res;
};

module.exports = {
    we_invoke_get_hello
};