import aws4 from '../../lib/aws4'


let initialized = false;

async function init() {
  if (initialized) {
    return;
  }

  process.env.AWS_REGION = "us-east-1"
  process.env.AWS_PROFILE = "petark"
  process.env.STAGE = 'dev'
  process.env.log_level = 'DEBUG'
  process.env.order_events_stream = "order-events-dev"
  process.env.cognito_user_pool_id = "us-east-1_HLwEEmCxW"
  process.env.cognito_client_id = "3n6bcn2u1r4q46i53jkic26stt"

  await aws4.init();

  initialized = true;
}

export default init;