import _  from 'lodash'

const APP_ROOT = '../..';
const mode    = process.env.TEST_MODE;

async function viaHandler(event, functionName) {  
    const handler = require(`${APP_ROOT}/functions/${functionName}`).handler;
    console.log(`invoking via handler function ${functionName}`);
  
    try {
      const context = {};
      const response = await handler(event, context);
      const contentType = _.get(response, 'headers.content-type', 'application/json');
      if (response.body && contentType === 'application/json') {
        response.body = JSON.parse(response.body);
      }
      return response;
    }
    catch(err) {
      return err;
    }
}

async function place_order_invalid_request() {
  const request = {
    body: undefined
  }

  return await viaHandler(request, 'place-order')
}

async function place_order_invalid_restaurantName() {
  const request = {
    body: JSON.stringify({
      "restaurantName": undefined
    })
  }

  return await viaHandler(request, 'place-order')
}

async function place_order_unauthorized() {
  const request = {
    body: JSON.stringify({
      "restaurantName": "test restaurant"
    })
  }

  return await viaHandler(request, 'place-order')
}

async function place_order_authorized() {
    const request = {
      body: JSON.stringify({
        "restaurantName": "test restaurant"
      }),
      requestContext: {
        authorizer: {
          claims: {
            email: "petar.korudzhiev@gmail.com"
          }
        }
      }
    }

    return await viaHandler(request, 'place-order')
}

export {
  place_order_invalid_request,
  place_order_invalid_restaurantName,
  place_order_authorized,
  place_order_unauthorized
}