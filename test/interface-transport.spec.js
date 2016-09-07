/* eslint-env mocha */
'use strict'

var tape = require('tape')
var tests = require('interface-transport/tests')
var conn = require('../src')

describe('interface-transport', () => {
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
