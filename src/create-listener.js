'use strict'

const debug = require('debug')
const log = debug('libp2p:utp:listen')
const logError = debug('libp2p:utp:listen:error')

const multiaddr = require('multiaddr')
const includes = require('lodash.includes')
const utp = require('utp-native')
const { EventEmitter } = require('events')

const Libp2pSocket = require('./socket')
const getMultiaddr = require('./get-multiaddr')

const { IPFS_MA_CODE, CLOSE_TIMEOUT } = require('./constants')

module.exports = (handler) => {
  const listener = new EventEmitter()

  const server = utp.createServer((socket) => {
    // Avoid uncaught errors cause by unstable connections
    socket.on('error', (err) => {
      logError('Error emitted by server handler socket: ' + err.message)
    })

    const addr = getMultiaddr(socket)
    const s = new Libp2pSocket(socket, addr)

    s.getObservedAddrs = (cb) => cb(null, [addr])

    trackSocket(server, socket)

    handler && handler(s)
    listener.emit('connection', s)
  })

  server.on('listening', () => listener.emit('listening'))
  server.on('error', (err) => listener.emit('error', err))
  server.on('close', () => listener.emit('close'))

  // Keep track of open connections to destroy in case of timeout
  server.__connections = {}

  listener.close = (options = {}) => {
    if (!server.listening) {
      return
    }

    return new Promise((resolve, reject) => {
      const start = Date.now()

      // Attempt to stop the server. If it takes longer than the timeout,
      // destroy all the underlying sockets manually.
      const timeout = setTimeout(() => {
        log('Timeout closing server after %dms, destroying connections manually', Date.now() - start)
        Object.keys(server.__connections).forEach((key) => {
          log('destroying %s', key)
          server.__connections[key].destroy()
        })
        resolve()
      }, options.timeout || CLOSE_TIMEOUT)

      server.once('close', () => clearTimeout(timeout))

      server.close((err) => err ? reject(err) : resolve())
    })
  }

  let ipfsId
  let listeningAddr

  listener.listen = (ma) => {
    listeningAddr = ma
    if (includes(ma.protoNames(), 'ipfs')) {
      ipfsId = getIpfsId(ma)
      listeningAddr = ma.decapsulate('ipfs')
    }

    const lOpts = listeningAddr.toOptions()

    return new Promise((resolve, reject) => {
      server.listen(Number(lOpts.port), lOpts.host, (err) => {
        if (err) {
          return reject(err)
        }

        log('Listening on %s %s', lOpts.port, lOpts.host)
        resolve()
      })
    })
  }

  listener.getAddrs = () => {
    const multiaddrs = []
    const addr = server.address()

    if (!addr) {
      throw new Error('Listener is not ready yet')
    }

    let ma
    if (addr.family === 'IPv6') {
      ma = multiaddr(`/ip6/${addr.address}/udp/${addr.port}/utp`)
    } else if (addr.family === 'IPv4') {
      /* eslint-disable no-console */
      console.log(`/ip4/${addr.address}/udp/${addr.port}/utp`)
      /* eslint-enable no-console */
      ma = multiaddr(`/ip4/${addr.address}/udp/${addr.port}/utp`)
    }

    if (ipfsId) {
      ma = ma.encapsulate('/ipfs/' + ipfsId)
    }

    multiaddrs.push(ma)

    return multiaddrs
  }

  return listener
}

function getIpfsId (ma) {
  return ma.stringTuples().filter((tuple) => {
    return tuple[0] === IPFS_MA_CODE
  })[0][1]
}

function trackSocket (server, socket) {
  const key = `${socket.remoteAddress}:${socket.remotePort}`
  server.__connections[key] = socket

  socket.on('close', () => {
    delete server.__connections[key]
  })
}
