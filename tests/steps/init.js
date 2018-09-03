import aws4 from '../../lib/aws4'


let initialized = false;

async function init() {
  if (initialized) {
    return;
  }

  process.env.AWS_REGION = "us-east-1"
  process.env.STAGE = 'dev'
  process.env.log_level = 'DEBUG'
  process.env.order_events_stream = "order-events-dev"
  process.env.cognito_user_pool_id = "us-east-1_TX75tY5mL"
  process.env.cognito_server_client_id = "163uhv5ujsrrjv825drbmi2gte"

  await aws4.init();

  initialized = true;
}

export default init;