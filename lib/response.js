export function success(body) {
    return buildResponse(200, body);
}
  
export function failure(body) {
    return buildResponse(500, body);
}

export function badRequest(body) {
    return buildResponse(400, body);
}

export function unAuthorized(body) {
    return buildResponse(401, body);
}
  
function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    };
}