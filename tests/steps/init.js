import aws4 from '../../lib/aws4'
import co   from 'co'
import AWS  from 'aws-sdk'
import _    from 'lodash'

AWS.config.region = 'us-east-1'
const SSM = new AWS.SSM();

let initialized = false;

const getParameters = co.wrap(function* (keys) {
  const prefix = '/order-system/dev/';
  const req = {
    Names: keys.map(key => `${prefix}${key}`)
  }
  const resp = yield SSM.getParameters(req).promise();
  return _.reduce(resp.Parameters, function(obj, param) {
    obj[param.Name.substr(prefix.length)] = param.Value
    return obj;
  }, {})
})

const init = co.wrap(function* () {
  if (initialized) {
    return;
  }

  const params = yield getParameters([
    'cognito_user_pool_id',
    'cognito_client_id'
  ]);  

  process.env.AWS_REGION = "us-east-1"
  process.env.AWS_PROFILE = "petark"
  process.env.STAGE = 'dev'
  process.env.log_level = 'DEBUG'
  process.env.cognito_user_pool_id = params.cognito_user_pool_id
  process.env.cognito_client_id = params.cognito_client_id

  yield aws4.init();

  initialized = true;
})

export default init;