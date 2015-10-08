//init
const expect = require("chai").expect;

const response = require("./../index");
const _ = require("lodash");

function getMockResponse(options) {

  return {

    status(statusCode) {
      expect(statusCode).to.eql(options.expected.statusCode);
    },
    type(type) {
      expect(type).to.eql("application/json");
    },
    json(data) {
      expect(data).to.eql(options.expected.data);
    }

  };

}

describe("response status codes", function() {

  _.each(response.statusCodes, (statusCode, name) => {

    it(`${name} returns ${statusCode}`, () => {
      const BODY = { coolMessage: `hey you deserve a ${statusCode}!`};
      const res = getMockResponse({expected: {statusCode, data: BODY }});

      const newResponse = response[name];
      newResponse(res)(BODY);
    });

  });

});


describe("response combinations", () => {

  describe("OkOrNotFound", () => {

    it("returns 404 if no data", () => {
      const res = getMockResponse({expected: {statusCode: 404, data: null }});
      response.OkOrNotFound(res)(null);
    });

    it("returns 200 if data", () => {
      const res = getMockResponse({expected: {statusCode: 200, data: { message: "data" } }});
      response.OkOrNotFound(res)("data");
    });

  });

  describe("BadRequestOr", () => {

    it("returns 400 if no data", () => {
      const res = getMockResponse({expected: {statusCode: 400, data: null }});
      response.BadRequestOr(response.Ok)(res)(null);
    });

    it("returns otherResponse if data", () => {
      const res = getMockResponse({expected: {statusCode: 200, data: { message: "data" } }});
      response.BadRequestOr(response.Ok)(res)("data");
    });

  });


  describe("NotFoundOr", () => {

    it("returns 400 if no data", () => {
      const res = getMockResponse({expected: {statusCode: 404, data: null }});
      response.NotFoundOr(response.Ok)(res)(null);
    });

    it("returns otherResponse if data", () => {
      const res = getMockResponse({expected: {statusCode: 200, data: { message: "data" } }});
      response.NotFoundOr(response.Ok)(res)("data");
    });

  });

  describe("ReturnError", () => {
    function createError(name, message) {
      const error = new Error(message);
      error.name = name;
      return error;
    }

    const errorHandler = {
      "BadCoderError"(res) {
        return (err) => {
          return response.AlreadyReported(res)(err.message); //we already now is a bad coder error!
        };
      }
    };

    it("handles the error with the errorHandler", () => {
      const res = getMockResponse({expected: {statusCode: 208, data: { message: 'this code sucks!' } }});
      response.ReturnError(errorHandler)(res)(createError("BadCoderError", "this code sucks!"));
    });

    it("returns InternalServerError if error has no handler", () => {
      const res = getMockResponse({expected: {statusCode: 500, data: { message: 'this code really sucks!' } }});
      response.ReturnError(errorHandler)(res)(createError("CodeSmellsToBadError", "this code really sucks!"));
    });

  });

});
