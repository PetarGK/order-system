import AWS from 'aws-sdk'
import co  from 'co'

AWS.config.region = 'us-east-1'

const cognito = new AWS.CognitoIdentityServiceProvider();

const an_authenticated_user = co.wrap(function* (user) {
  const req = {
    UserPoolId: process.env.cognito_user_pool_id,
    Username: user.username
  }
  yield cognito.adminDeleteUser(req).promise()
  
  console.log(`[${user.username}] - user deleted`)
})

export { an_authenticated_user }