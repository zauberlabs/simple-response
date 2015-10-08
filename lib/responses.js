const _ = require("lodash");

const statusCodes = {
  "Continue": 100,
  "SwitchingProtocols": 101,
  "Processing": 102,

  "Ok": 200,
  "Created": 201,
  "Accepted": 202,
  "NonAuthoritativeInformation": 203,
  "NoContent": 204,
  "ResetContent": 205,
  "PartialContent": 206,
  "MultiStatus": 207,
  "AlreadyReported": 208,
  "ImUsed": 226,

  "MultipleChoices": 300,
  "MovedPermanently": 301,
  "Found": 302,
  "SeeOther": 303,
  "NotModified": 304,
  "UseProxy": 305,
  "TemporaryRedirect": 307,
  "PermanentRedirect": 308,

  "BadRequest": 400,
  "Unauthorized": 401,
  "PaymentRequired": 402,
  "Forbidden": 403,
  "NotFound": 404,
  "MethodNotAllowed": 405,
  "NotAcceptable": 406,
  "ProxyAuthenticationRequired": 407,
  "RequestTimeout": 408,
  "Conflict": 409,
  "Gone": 410,
  "LengthRequired": 411,
  "PreconditionFailed": 412,
  "PayloadTooLarge": 413,
  "URITooLong": 414,
  "UnsupportedMediaType": 415,
  "RequestedRangeNotSatisfiable": 416,
  "ExpectationFailed": 417,
  "UnprocessableEntity": 422,
  "Locked": 423,
  "FailedDependency": 424,
  "UpgradeRequired": 426,
  "PreconditionRequired": 428,
  "TooManyRequests": 429,
  "RequestHeaderFieldsTooLarge": 431,

  "InternalServerError": 500,
  "NotImplemented": 501,
  "BadGateway": 502,
  "ServiceUnavailable": 503,
  "GatewayTimeout": 504,
  "HttpVersionNotSupported": 505,
  "VariantAlsoNegotiates": 506,
  "InsufficientStorage": 507,
  "LoopDetected": 508,
  "NotExtended": 510,
  "NetworkAuthenticationRequired": 511
};


function _isSerializableAndObject(data) {
  return typeof data === "object";
}

function _isSerializableAndNotObject(data) {
  return _.contains(["string", "number", "boolean"], typeof data);
}

function _payload(data) {
  if (_isSerializableAndObject(data)) {
    return data;
  } else if (_isSerializableAndNotObject(data)) {
    return { message: data };
  } else {
    return {};
  }
}

function _newResponse(statusCode) {
  return (httpResponse) => {
    return (data) => {
      httpResponse.status(statusCode);
      httpResponse.type("application/json");
      httpResponse.json(_payload(data));
    };
  };
}

//Build responses.
const Response = _.mapValues(statusCodes, (statusCode) => {
  return _newResponse(statusCode);
});

Response.statusCodes = statusCodes;

// special combinations
Response.OkOrNotFound = (httpResponse) => {
  return (data) => {
    if (data === null) {
      Response.NotFound(httpResponse)(data);
    } else {
      Response.Ok(httpResponse)(data);
    }
  };
};

Response.BadRequestOr = (otherResponse) => {
  return (httpResponse) => {
    return (data) => {
      if (data === null) {
        Response.BadRequest(httpResponse)(data);
      } else {
        otherResponse(httpResponse)(data);
      }
    };
  };
};

Response.NotFoundOr = (otherResponse) => {
  return (httpResponse) => {
    return (data) => {
      if (data === null) {
        Response.NotFound(httpResponse)(data);
      } else {
        otherResponse(httpResponse)(data);
      }
    };
  };
};

Response.ReturnError = (cases) => {
  return (httpResponse) => {
    return (error) => {
      if (cases[error.name]) {
        cases[error.name](httpResponse)(error);
      } else {
        Response.InternalServerError(httpResponse)({
          message: error.message
        });
      }
    };
  };
};

module.exports = Response;
