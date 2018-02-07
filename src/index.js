'use strict'

const utp = require('utp-native')
// const toPull = require('stream-to-pull-stream')
const mafmt = require('mafmt')
const includes = require('lodash.includes')
// const isFunction = require('lodash.isfunction')
// const Connection = require('interface-connection').Connection
// const once = require('once')
const debug = require('debug')
const log = debug('libp2p:utp')

class UTP {
  dial (ma, options, callback) {
  }

  createListener (options, handler) {
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

module.exports = UTP
