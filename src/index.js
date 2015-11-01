var utp = require('utp')

exports = module.exports

exports.dial = function (multiaddr, options) {
  options.ready = options.ready || function noop () {}
  var opts = multiaddr.toOptions()
  var client = utp.connect(opts.port, opts.host)

  client.once('connect', options.ready)

  return client
}

exports.createListener = utp.createServer
