/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const UTP = require('../src')
const multiaddr = require('multiaddr')

describe('filter addrs', () => {
  const base = '/ip4/127.0.0.1'
  const ipfs = '/ipfs/Qmb6owHp6eaWArVbcJJbQSyifyJBttMMjYV76N2hMbf5Vw'

  let utp

  before(() => {
    utp = new UTP()
  })

  it('filter valid addrs for this transport', () => {
    const ma1 = multiaddr(base + '/tcp/9090')
    const ma2 = multiaddr(base + '/udp/9090')
    const ma3 = multiaddr(base + '/tcp/9090/http')
    const ma4 = multiaddr(base + '/tcp/9090' + ipfs)
    const ma5 = multiaddr(base + '/tcp/9090/http' + ipfs)
    const ma6 = multiaddr('/ip4/127.0.0.1/tcp/9090/p2p-circuit' + ipfs)
    const ma7 = multiaddr(base + '/udp/9090/utp')
    const ma8 = multiaddr(base + '/udp/9090/utp' + ipfs)

    const valid = utp.filter([
      ma1,
      ma2,
      ma3,
      ma4,
      ma5,
      ma6,
      ma7,
      ma8
    ])

    expect(valid.length).to.equal(2)
    expect(valid[0]).to.eql(ma7)
    expect(valid[1]).to.eql(ma8)
  })

  it('filter a single addr for this transport', () => {
    const ma1 = multiaddr(base + '/udp/9090/utp')

    const valid = utp.filter(ma1)
    expect(valid.length).to.equal(1)
    expect(valid[0]).to.eql(ma1)
  })
})
