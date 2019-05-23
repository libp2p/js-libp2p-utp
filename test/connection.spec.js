/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const UTP = require('../src')

describe('Valid libp2p Connection', () => {
  let utp

  beforeEach(() => {
    utp = new UTP()
  })

  it.skip('.getObservedAddrs', (done) => {
    expect(utp).to.exist()
  })
  it.skip('.getPeerInfo', (done) => {})
  it.skip('.setPeerInfo', (done) => {})
})
