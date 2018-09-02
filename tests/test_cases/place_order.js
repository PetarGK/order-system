import init from '../steps/init'
import * as when from '../steps/when'
import exp from 'chai'

const expect = exp.expect;

describe(`When we invoke the POST /place_order endpoint`, function() {
  before(async function() {
    await init()
  })

  it(`Should place order`,async function() {

    const response = await when.place_order_authorized()

    expect(response.statusCode).to.equal(200)
    expect(response.body).to.not.be.null

    const body = response.body
    expect(body.orderId).to.not.be.null    
  })
})

describe(`When we invoke the POST /place_order endpoint`, function() {
  before(async function() {
    await init()
  })

  it(`Should return unauthorized`,async function() {

    const response = await when.place_order_unauthorized()

    expect(response.statusCode).to.equal(401)
    expect(response.body).to.not.be.null
    
    const body = response.body
    expect(body.message).to.not.be.null
    expect(body.message).to.equal('unauthorized')
  })
})