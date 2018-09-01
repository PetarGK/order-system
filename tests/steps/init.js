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

  await aws4.init();

  initialized = true;
}

export default init;