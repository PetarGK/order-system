import init from '../steps/init'
import * as when from '../steps/when'
import exp from 'chai'

const expect = exp.expect;
/*
describe(`When we invoke the POST /place_order endpoint`, function() {
  before(async function() {
    await init()
  })

  it(`Should place order`,async function() {

    const response = await when.place_order_authorized()

    expect(response.statusCode).to.equal(200)
  })
})*/

describe(`When we invoke the POST /place_order endpoint`, function() {
  before(async function() {
    await init()
  })

  it(`Should return unauthorized`,async function() {

    const response = await when.place_order_unauthorized()

    console.log('response: ' + JSON.stringify(response))
    //expect(response.statusCode).to.equal(401)
  })
})