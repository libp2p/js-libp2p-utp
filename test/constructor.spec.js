/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const UTP = require('../src')

describe('Constructor', () => {
  it('create an instance', () => {
    const utp = new UTP()
    expect(utp).to.exist()
  })
})
