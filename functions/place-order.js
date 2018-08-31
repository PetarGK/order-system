import correlationIds from '../lib/correlation-ids'
import kinesis        from '../lib/kinesis'
import * as log       from '../lib/log'
import _              from 'lodash'

export const handler = async (event) => {
    const req = JSON.parse(event.body);
    log.debug(`request body is valid JSON`, { requestBody: event.body });

    const userEmail = _.get(event, 'requestContext.authorizer.claims.email');

    if (!userEmail) {
        log.error('unauthorized request, user email is not provided');
    
        return {
            statusCode: 401,
            body: "unauthorized"                    
        }
    }    

    const restaurantName = req.restaurantName;
    const orderId = chance.guid();    

    correlationIds.set('order-id', orderId);
    correlationIds.set('restaurant-name', restaurantName);
    correlationIds.set('user-email', userEmail);
    
    log.debug(`placing order...`, { orderId, restaurantName, userEmail });

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

    log.debug(`published event into Kinesis`, { eventName: 'order_placed' });

    return {
        statusCode: 200,
        body: JSON.stringify({ orderId })
    }
}