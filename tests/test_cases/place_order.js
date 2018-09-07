import init from '../steps/init'
import * as when from '../steps/when'
import * as given from '../steps/given'
import * as tearDown from '../steps/tearDown'
import exp from 'chai'
import co  from 'co'

const expect = exp.expect;

describe(`When we invoke the POST /place_order endpoint`, function() {
  let user
  before(co.wrap(function*() {
    yield init()
    user = yield given.an_authenticated_user()
  }))

  after(co.wrap(function*() {
    yield tearDown.an_authenticated_user(user)
  }))

  it(`Should return invalid request`,co.wrap(function*() {

    const response = yield when.place_order_invalid_request(user)

    expect(response.statusCode).to.equal(400)
    expect(response.body).to.not.be.null

    const body = response.body
    console.log(body);
    expect(body.message).to.not.be.null     
    expect(body.message).to.equal('Invalid request')
  }))
})

describe(`When we invoke the POST /place_order endpoint`, function() {
  let user
  before(co.wrap(function*() {
    yield init()
    user = yield given.an_authenticated_user()
  }))

  after(co.wrap(function*() {
    yield tearDown.an_authenticated_user(user)
  }))

  it(`Should return invalid restaurantName`,co.wrap(function*() {

    const response = yield when.place_order_invalid_restaurantName(user)

    expect(response.statusCode).to.equal(400)
    expect(response.body).to.not.be.null

    const body = response.body
    expect(body.message).to.not.be.null     
    expect(body.message).to.equal('Invalid restaurantName name')   
  }))
})

describe(`When we invoke the POST /place_order endpoint`, function() {
  let user
  before(co.wrap(function*() {
    yield init()
    user = yield given.an_authenticated_user()
  }))

  after(co.wrap(function*() {
    yield tearDown.an_authenticated_user(user)
  }))

  it(`Should return unauthorized`,co.wrap(function*() {

    const response = yield when.place_order_unauthorized(user)

    expect(response.statusCode).to.equal(401)
    expect(response.body).to.not.be.null
    
    const body = response.body
    expect(body.message).to.not.be.null
    expect(body.message).to.equal('unauthorized')
  }))
})

describe(`When we invoke the POST /place_order endpoint`, function() {
  let user
  before(co.wrap(function*() {
    yield init()
    user = yield given.an_authenticated_user()
  }))

  after(co.wrap(function*() {
    yield tearDown.an_authenticated_user(user)
  }))

  it(`Should place order`,co.wrap(function*() {

    const response = yield when.place_order_authorized(user)

    expect(response.statusCode).to.equal(200)
    expect(response.body).to.not.be.null

    const body = response.body
    expect(body.orderId).to.not.be.null    
  }))
})