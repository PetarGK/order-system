import * as correlationIds        from '../lib/correlation-ids'
import kinesis                    from '../lib/kinesis'
import * as log                   from '../lib/log'
import * as response              from '../lib/response'
import _                          from 'lodash'
import ch                         from 'chance'
import middy                      from 'middy'
import { ssm }                    from 'middy/middlewares'
import co                         from 'co'
import captureCorrelationIds      from '../middleware/capture-correlation-ids'

const chance = ch.Chance();
const STAGE     = process.env.STAGE;

const handler = middy(co.wrap(function* (event, context, cb) {
    if (!event.body) {
        cb(null, response.badRequest({ message: "Invalid request" }))
    }

    const request = JSON.parse(event.body)

    log.debug(`request body is valid JSON`, { requestBody: event.body })

    if (!request.restaurantName) {
        cb(null, response.badRequest({ message: "Invalid restaurantName name" }))
    }

    const userEmail = _.get(event, 'requestContext.authorizer.claims.email')

    if (!userEmail) {
        log.error('unauthorized request, user email is not provided')
    
        cb(null, response.unAuthorized({ message: "unauthorized" }))
    }    

    const restaurantName = request.restaurantName;
    const orderId = chance.guid();    

    correlationIds.set('order-id', orderId);
    correlationIds.set('restaurant-name', restaurantName);
    correlationIds.set('user-email', userEmail);
    
    log.debug(`placing order...`, { orderId, restaurantName, userEmail })

    const data = {
        orderId,
        userEmail,
        restaurantName,
        eventType: 'order_placed'
    }    

    const kinesisReq = {
        Data: JSON.stringify(data), // the SDK would base64 encode this for us
        PartitionKey: orderId,
        StreamName: context.order_events_stream
    }

    yield kinesis.putRecord(kinesisReq);

    log.debug(`published event into Kinesis`, { eventName: 'order_placed' })

    cb(null, response.success({ orderId }))
})).use(captureCorrelationIds({ sampleDebugLogRate: 0.01 }))
   .use(ssm({
        cache: true,
        cacheExpiryInMillis: 3 * 60 * 1000, // 3 mins
        setToContext: true,
        names: {
            order_events_stream: `/order-system/${STAGE}/order_events_stream`
        }
    }))

export { handler }  