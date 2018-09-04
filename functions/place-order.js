import * as correlationIds        from '../lib/correlation-ids'
import kinesis                    from '../lib/kinesis'
import * as log                   from '../lib/log'
import * as response              from '../lib/response'
import _                          from 'lodash'
import ch                         from 'chance'
import middy                      from 'middy'
import captureCorrelationIds      from '../middleware/capture-correlation-ids'

const chance = ch.Chance();
const streamName = process.env.order_events_stream;

const handler = middy(async (event, context) => {
    if (!event.body) {
        return response.badRequest({ message: "Invalid request" })
    }

    const request = JSON.parse(event.body)

    log.debug(`request body is valid JSON`, { requestBody: event.body })

    if (!request.restaurantName) {
        return response.badRequest({ message: "Invalid restaurantName name" })
    }

    const userEmail = _.get(event, 'requestContext.authorizer.claims.email')

    if (!userEmail) {
        log.error('unauthorized request, user email is not provided')
    
        return response.unAuthorized({ message: "unauthorized" })
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
        StreamName: streamName
    }

    await kinesis.putRecord(kinesisReq);

    log.debug(`published event into Kinesis`, { eventName: 'order_placed' })

    return response.success({ orderId })
}).use(captureCorrelationIds({ sampleDebugLogRate: 0.01 }))

export { handler }  