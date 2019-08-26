'use strict'

const { Adapter } = require('interface-transport')
const withIs = require('class-is')
const UTP = require('.')

// Legacy adapter to old transport & connection interface
class UTPAdapter extends Adapter {
  constructor () {
    super(new UTP())
  }
}

module.exports = withIs(UTPAdapter, {
  className: 'UTP',
  symbolName: '@libp2p/js-libp2p-utp/utp'
})
