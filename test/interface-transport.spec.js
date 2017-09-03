/* eslint-env mocha */
'use strict'

var tape = require('tape')
var tests = require('interface-transport')
var conn = require('../src')

describe.skip('interface-transport', () => {
  it('works', (done) => {
    tests(tape, {
      setup (t, cb) {
        cb(null, conn)
      },
      teardown (t, cb) {
        done()
        cb()
      }
    })
  })
})
