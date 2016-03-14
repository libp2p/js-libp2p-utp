/* eslint-env mocha */

const expect = require('chai').expect
const UTPlibp2p = require('../src')
const multiaddr = require('multiaddr')

describe('libp2p-utp', function () {
  this.timeout(10000)
  var utp

  it('create', (done) => {
    utp = new UTPlibp2p()
    expect(utp).to.exist
    done()
  })

  it('listen and dial', (done) => {
    const mh = multiaddr('/ip4/127.0.0.1/udp/9090/utp')
    utp.createListener(mh, (socket) => {
      console.log('hey')
      expect(socket).to.exist
      socket.on('data', (data) => {})
      socket.on('end', () => {
        console.log('listener end')
      })
      socket.on('error', (err) => {
        console.log('listener error', err)
      })

      socket.end()
      // utp.close(() => {
      //   done()
      // })
    }, () => {
      const socket = utp.dial(mh)
      socket.on('end', () => {
        console.log('dialer end')
      })

      socket.on('close', () => {
        console.log('dialer close')
      })

      socket.on('error', (err) => {
        console.log('dialer error', err)
      })
      // socket.end()
    })

    // TODO: NEXT - need to confirm if we can have halfOpen streams, otherwise we need to implement that on top
    // https://github.com/mafintosh/utp-native/issues/5
  })

  it.skip('listen on several', (done) => {
    const mh1 = multiaddr('/ip4/127.0.0.1/udp/9090/utp')
    const mh2 = multiaddr('/ip4/127.0.0.1/udp/9091/utp')
    const utp = new UTPlibp2p()

    utp.createListener([mh1, mh2], (socket) => {}, () => {
      utp.close(done)
    })
  })

  it.skip('get observed addrs', (done) => {
    const mh = multiaddr('/ip4/127.0.0.1/udp/9090/utp')
    var dialerObsAddrs
    var listenerObsAddrs

    utp.createListener(mh, (conn) => {
      expect(conn).to.exist
      dialerObsAddrs = conn.getObservedAddrs()
      conn.end()
    }, () => {
      const conn = utp.dial(mh)
      conn.on('end', () => {
        listenerObsAddrs = conn.getObservedAddrs()
        conn.end()

        utp.close(() => {
          expect(listenerObsAddrs[0]).to.deep.equal(mh)
          expect(dialerObsAddrs.length).to.equal(1)
          done()
        })
      })
    })
  })

  it.skip('listen on IPv6', (done) => {})
})
