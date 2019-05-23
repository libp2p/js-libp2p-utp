/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const nativeUTP = require('utp-native')
const pull = require('pull-stream')
const multiaddr = require('multiaddr')

const UTP = require('../src')
const isCI = process.env.CI

describe('Listener (.createListener => listener)', () => {
  let utp

  function ma (port) {
    const base = '/ip4/127.0.0.1/udp/'
    return multiaddr(`${base}${port}/utp`)
  }

  beforeEach(() => {
    utp = new UTP()
  })

  it('.close with connections, through timeout', function (done) {
    this.timeout(20 * 1000)

    const listener = utp.createListener((conn) => pull(conn, conn))

    const addr = ma(6000)
    const connectOptions = addr.toOptions()

    listener.listen(addr, () => {
      const socket1 = nativeUTP.connect(Number(connectOptions.port), connectOptions.host)
      const socket2 = nativeUTP.connect(Number(connectOptions.port), connectOptions.host)

      socket1.write('Some data that is never handled')
      socket1.end()

      socket1.on('error', (err) => expect(err).to.not.exist())
      socket2.on('error', (err) => expect(err).to.not.exist())
      socket1.on('connect', () => listener.close(done))
    })
  })

  it('.listen on port 0', (done) => {
    const listener = utp.createListener((conn) => {})

    listener.listen(ma(0), () => {
      listener.close(done)
    })
  })

  // TODO: Get utp to work with IPv6 Addresses
  it.skip('.listen on IPv6 addr', function (done) {
    if (isCI) { return this.skip() }

    const ma = multiaddr('/ip6/::/udp/12000/utp')

    const listener = utp.createListener((conn) => {})
    listener.listen(ma, () => {
      listener.close(done)
    })
  })

  it('.listen on any Interface', (done) => {
    const ma = multiaddr('/ip4/0.0.0.0/udp/12000/utp')

    const listener = utp.createListener((conn) => {})

    listener.listen(ma, () => {
      listener.close(done)
    })
  })

  it('.getAddrs', (done) => {
    const listener = utp.createListener((conn) => {})
    const addr = ma(12000)

    listener.listen(addr, () => {
      listener.getAddrs((err, multiaddrs) => {
        expect(err).to.not.exist()
        expect(multiaddrs.length).to.equal(1)
        expect(multiaddrs[0]).to.eql(addr)
        listener.close(done)
      })
    })
  })

  it('.getAddrs on port 0 listen', (done) => {
    const addr = ma(0)

    const listener = utp.createListener((conn) => {})
    listener.listen(addr, () => {
      listener.getAddrs((err, multiaddrs) => {
        expect(err).to.not.exist()
        expect(multiaddrs.length).to.equal(1)
        listener.close(done)
      })
    })
  })

  // TODO: Get utp to understand the meaning of 0.0.0.0
  it.skip('.getAddrs from listening on 0.0.0.0', (done) => {
    const addr = multiaddr('/ip4/0.0.0.0/udp/12000/utp')

    const listener = utp.createListener((conn) => {})

    listener.listen(addr, () => {
      listener.getAddrs((err, multiaddrs) => {
        expect(err).to.not.exist()
        expect(multiaddrs.length > 0).to.equal(true)
        expect(multiaddrs[0].toString().indexOf('0.0.0.0')).to.equal(-1)
        listener.close(done)
      })
    })
  })

  // TODO: Get utp to understand the meaning of 0.0.0.0
  it.skip('.getAddrs from listening on 0.0.0.0 and port 0', (done) => {
    const addr = multiaddr('/ip4/0.0.0.0/udp/0/utp')
    const listener = utp.createListener((conn) => {})

    listener.listen(addr, () => {
      listener.getAddrs((err, multiaddrs) => {
        expect(err).to.not.exist()
        expect(multiaddrs.length > 0).to.equal(true)
        expect(multiaddrs[0].toString().indexOf('0.0.0.0')).to.equal(-1)
        listener.close(done)
      })
    })
  })

  it('.getAddrs preserves IPFS Id', (done) => {
    const ipfsId = '/ipfs/Qmb6owHp6eaWArVbcJJbQSyifyJBttMMjYV76N2hMbf5Vw'
    const addr = ma(9090).encapsulate(ipfsId)

    const listener = utp.createListener((conn) => {})

    listener.listen(addr, () => {
      listener.getAddrs((err, multiaddrs) => {
        expect(err).to.not.exist()
        expect(multiaddrs.length).to.equal(1)
        expect(multiaddrs[0]).to.eql(addr)
        listener.close(done)
      })
    })
  })
})

/*
describe('Dialer (.dial)', () => {
  let utp

  beforeEach(() => {
    utp = new UTP()
  })

  it.skip('things', () => {
  })
})
*/
