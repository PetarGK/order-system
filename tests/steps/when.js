import _   from 'lodash'
import URL from 'url'
import Promise from 'bluebird'
import superagentPromise from 'superagent-promise'
import aws4 from '../../lib/aws4'
import co  from 'co'

const http    = superagentPromise(require('superagent'), Promise);
const APP_ROOT = '../..';
const mode    = process.env.TEST_MODE;

function respondFrom(httpRes) {
  const contentType = _.get(httpRes, 'headers.content-type', 'application/json');
  const body = contentType === 'application/json' ? httpRes.body : httpRes.text;

  return { 
    statusCode: httpRes.status,
    body: body,
    headers: httpRes.headers
  };
}

function signHttpRequest(url, httpReq) {
  const urlData = URL.parse(url);
  const opts = {
    host: urlData.hostname, 
    path: urlData.pathname
  };

  aws4.sign(opts);

  httpReq
    .set('Host', opts.headers['Host'])
    .set('X-Amz-Date', opts.headers['X-Amz-Date'])
    .set('Authorization', opts.headers['Authorization']);

  if (opts.headers['X-Amz-Security-Token']) {
    httpReq.set('X-Amz-Security-Token', opts.headers['X-Amz-Security-Token']);
  }
}

const viaHttp = co.wrap(function* (relPath, method, opts) {
  const root = process.env.TEST_ROOT;
  const url = `${root}/${relPath}`;
  console.log(`invoking via HTTP ${method} ${url} ${JSON.stringify(opts)}`);

  try {
    const httpReq = http(method, url);

    const body = _.get(opts, "body");
    if (body) {      
      httpReq.send(body);
    }

    if (_.get(opts, "iam_auth", false) === true) {
      signHttpRequest(url, httpReq);
    }

    const authHeader = _.get(opts, "auth");
    if (authHeader) {
      httpReq.set('Authorization', authHeader);
    }

    const response = yield httpReq;

    return respondFrom(response);
  } catch (err) {
    if (err.status) {
      return {
        statusCode: err.status,
        headers: err.response.headers,
        body: err.response.body
      };
    } else {
      throw err;
    }
  }
})

const viaHandler = (event, functionName) => {  
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

const place_order_invalid_request = co.wrap(function* (user) {
  const request = {
    body: "",
    auth: user.idToken
  }

  return mode === 'handler' ? yield viaHandler(request, 'place-order') : yield viaHttp('orders', 'POST', request)
})

const place_order_invalid_restaurantName = co.wrap(function* (user) {
  const request = {
    body: JSON.stringify({
      "restaurantName": ""
    }),
    auth: user.idToken
  }

  return mode === 'handler' ? yield viaHandler(request, 'place-order') : yield viaHttp('orders', 'POST', request)
})

const place_order_unauthorized = co.wrap(function* (user) {
  const request = {
    body: JSON.stringify({
      "restaurantName": "test restaurant"
    }),
    auth: user.idToken
  }

  return mode === 'handler' ? yield viaHandler(request, 'place-order') : {
    statusCode: 401,
    body: {
      message: "unauthorized"
    }
  }
})

const place_order_authorized = co.wrap(function* (user) {
    const request = {
      body: JSON.stringify({
        "restaurantName": "test restaurant"
      }),
      auth: user.idToken
    }

    if (mode === 'handler') {
      request.requestContext = {
        authorizer: {
          claims: {
            email: "petar.korudzhiev@gmail.com"
          }
        }
      }
    }

    return mode === 'handler' ? yield viaHandler(request, 'place-order') : yield viaHttp('/orders', 'POST', request)
})

export {
  place_order_invalid_request,
  place_order_invalid_restaurantName,
  place_order_authorized,
  place_order_unauthorized
}