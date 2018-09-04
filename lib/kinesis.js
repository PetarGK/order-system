import AWS from 'aws-sdk'
import _ from 'lodash'
import * as log from './log'
import * as correlationIds from './correlation-ids'

const Kinesis = new AWS.Kinesis();

function tryJsonParse(data) {
    if (!_.isString(data)) {
      return null;
    }
  
    try {
      return JSON.parse(data);
    } catch (err) {
      log.warn('only JSON string data can be modified to insert correlation IDs');
      return null;
    }
}

function addCorrelationIds(data) {
    // only do with with JSON string data
    const payload = tryJsonParse(data);
    if (!payload) {
      return data;
    }
  
    const context = correlationIds.get();  
    const newData = { ...{}, __context__: context, payload }
    return JSON.stringify(newData);
}

async function putRecord(params) {
    const newData = addCorrelationIds(params.Data);
    params = { ...params, Data: newData }
  
    return await Kinesis.putRecord(params).promise();
}

const client = { ...Kinesis, putRecord }

export default client