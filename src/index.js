const utp = require('utp-native')

// const multiaddr = require('multiaddr')

exports = module.exports = UTP

function UTP () {
  if (!(this instanceof UTP)) {
    return new UTP()
  }

  const listeners = []

  this.dial = function (multiaddr, options) {
    if (!options) {
      options = {}
    }
    options.ready = options.ready || function noop () {}
    const conn = utp.connect(multiaddr.toOptions(), options.ready)
    conn.getObservedAddrs = () => {
      return [multiaddr]
    }
    return conn
  }

  this.createListener = (multiaddrs, options, handler, callback) => {
    if (typeof options === 'function') {
      callback = handler
      handler = options
      options = {}
    }

    if (!Array.isArray(multiaddrs)) {
      multiaddrs = [multiaddrs]
    }

    var freshMultiaddrs = []

    multiaddrs.forEach((m) => {
      const listener = utp.createServer((conn) => {
        conn.getObservedAddrs = () => {
          // TODO figure out if I can get some reasoning on observed multiaddrs
          return []
        }
        handler(conn)
      })

      console.log('->', m.toOptions())

      listener.listen(m.toOptions().port, m.toOptions().host, () => {
        // TODO understand how this applies to uTP
        freshMultiaddrs = multiaddrs
        callback(null, freshMultiaddrs)
      })
      listeners.push(listener)
    })
  }

  this.close = (callback) => {
    if (listeners.length === 0) {
      throw new Error('there are no listeners')
    }
    var count = 0
    listeners.forEach((listener) => {
      listener.close(() => {
        if (++count === listeners.length) {
          callback()
        }
      })
    })
  }

  this.filter = (multiaddrs) => {
    return multiaddrs.filter((ma) => {
      // TODO
      // https://github.com/whyrusleeping/js-mafmt/pull/2
    })
  }
}
