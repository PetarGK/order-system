import AWS from 'aws-sdk'
import ch  from 'chance'
import co  from 'co'

AWS.config.region = 'us-east-1';

const cognito = new AWS.CognitoIdentityServiceProvider();
const chance  = ch.Chance();

function random_password() {
  // needs number, special char, upper and lower case
  return `${chance.string({ length: 8})}B!gM0uth`;
}

const an_authenticated_user = co.wrap(function* () {
  const userpoolId = process.env.cognito_user_pool_id
  const clientId = process.env.cognito_client_id

  const firstName = chance.first()
  const lastName  = chance.last()
  const username  = `test-${chance.string({length: 2})}`
  const password  = random_password()
  const email     = `${firstName}.${lastName}@test.com`

  const createReq = {
    UserPoolId        : userpoolId,
    Username          : username,
    MessageAction     : 'SUPPRESS',
    TemporaryPassword : password,
    UserAttributes    : [
      { Name: "given_name",  Value: firstName },
      { Name: "family_name", Value: lastName },
      { Name: "email",       Value: email }
    ]
  }

  yield cognito.adminCreateUser(createReq).promise()

  console.log(`[${username}] - user is created`)
  
  const req = {
    AuthFlow        : 'ADMIN_NO_SRP_AUTH',
    UserPoolId      : userpoolId,
    ClientId        : clientId,
    AuthParameters  : {
      USERNAME: username,    
      PASSWORD: password
    }
  }
  const resp = yield cognito.adminInitiateAuth(req).promise()

  console.log(`[${username}] - initialised auth flow`)

  const challengeReq = {
    UserPoolId          : userpoolId,
    ClientId            : clientId,
    ChallengeName       : resp.ChallengeName,
    Session             : resp.Session,
    ChallengeResponses  : {
      USERNAME: username,
      NEW_PASSWORD: random_password()
    }
  }
  const challengeResp = yield cognito.adminRespondToAuthChallenge(challengeReq).promise()
  
  console.log(`[${username}] - responded to auth challenge`)

  return {
    username,
    firstName,
    lastName,
    idToken: challengeResp.AuthenticationResult.IdToken
  }
})

export { an_authenticated_user }