'use strict';

module.exports.handler = async (event) => {
  const response = {
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },        
      body: JSON.stringify({
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      })
  };

  return response;
};
