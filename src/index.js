'use strict'

const utp = require('utp-native')
const toPull = require('stream-to-pull-stream')
const mafmt = require('mafmt')
const withIs = require('class-is')
const includes = require('lodash.includes')
const isFunction = require('lodash.isfunction')
const Connection = require('interface-connection').Connection
const once = require('once')
const createListener = require('./create-listener.js')
const debug = require('debug')
const log = debug('libp2p:utp')

function noop () {}

class UTP {
  dial (ma, options, callback) {
    if (isFunction(options)) {
      callback = options
      options = {}
    }

    callback = once(callback || noop)

    const cOpts = ma.toOptions()
    log('Connecting (UTP) to %s %s', cOpts.port, cOpts.host)

    const rawSocket = utp.connect(cOpts)

    rawSocket.once('timeout', () => {
      log('timeout')
      rawSocket.emit('error', new Error('Timeout'))
    })

    rawSocket.once('error', callback)

    rawSocket.once('connect', () => {
      rawSocket.removeListener('error', callback)
      callback()
    })

    const socket = toPull.duplex(rawSocket)

    const conn = new Connection(socket)

    conn.getObservedAddrs = (callback) => {
      return callback(null, [ma])
    }

    return conn
  }

  createListener (options, handler) {
    if (isFunction(options)) {
      handler = options
      options = {}
    }

    handler = handler || noop

    return createListener(handler)
  }

  filter (multiaddrs) {
    if (!Array.isArray(multiaddrs)) {
      multiaddrs = [multiaddrs]
    }

    return multiaddrs.filter((ma) => {
      if (includes(ma.protoNames(), 'p2p-circuit')) {
        return false
      }

      if (includes(ma.protoNames(), 'ipfs')) {
        ma = ma.decapsulate('ipfs')
      }

      return mafmt.UTP.matches(ma)
    })
  }
}

module.exports = withIs(UTP, { className: 'UTP', symbolName: '@libp2p/js-libp2p-utp/utp' })
