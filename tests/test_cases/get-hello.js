'use strict';

const expect = require('chai').expect;
const when = require('../steps/when');
const init = require('../steps/init').init;

describe(`When we invoke the GET / endpoint`, async function () {
  //before();

  it(`Should return example response`, async function () {
    let res = await when.we_invoke_get_hello();

    expect(res.statusCode).to.equal(200);
    expect(res.headers['content-type']).to.equal('application/json');
    expect(res.body).to.not.be.null;

  });
});