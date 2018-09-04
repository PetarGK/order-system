import * as correlationIds from './correlation-ids'

const LogLevels = {
    DEBUG : 0,
    INFO  : 1,
    WARN  : 2,
    ERROR : 3
}

const DEFAULT_CONTEXT = {
    awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
    functionMemorySize: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
    stage: process.env.ENVIRONMENT || process.env.STAGE
}

function getContext () {
    // if there's a global variable for all the current request context then use it
    const context = correlationIds.get();
    if (context) {
      return { ...DEFAULT_CONTEXT, context }
    }
  
    return DEFAULT_CONTEXT;
}

// default to debug if not specified
function logLevelName() {
    return process.env.log_level || 'DEBUG';
}

function isEnabled (level) {
    return level >= LogLevels[logLevelName()];
}

function appendError(params, err) {
    if (!err) {
      return params;
    }
  
    return { ...params, 
                errorName: err.name, 
                errorMessage: err.message, 
                stackTrace: err.stack }
}

function log (levelName, message, params) {
    if (!isEnabled(LogLevels[levelName])) {
      return;
    }
  
    let context = getContext();
    let logMsg = { ...context, params }
    logMsg.level = levelName;
    logMsg.message = message;
  
    console.log(JSON.stringify(logMsg));
}

const debug =  (msg, params) => log('DEBUG', msg, params)
const info = (msg, params) => log('INFO',  msg, params)
const warn = (msg, params, error) => log('WARN',  msg, appendError(params, error))
const error = (msg, params, error) => log('ERROR', msg, appendError(params, error))
const enableDebug = () => {
    const oldLevel = process.env.log_level;
    process.env.log_level = 'DEBUG';
  
    // return a function to perform the rollback
    return () => {
      process.env.log_level = oldLevel;
    }
}

export { debug, info, warn, error, enableDebug }