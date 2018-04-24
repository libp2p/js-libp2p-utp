'use strict'

const debug = require('debug')

module.exports = socket => {
  let addr = socket.remoteAddress + ':' + socket.remotePort

  let log = debug('libp2p:utp:socket#' + addr)

  let endedSource = false
  let endedSink = false
  let ended = false
  let q = []
  let wait

  function tryEnd () {
    if (endedSource && endedSink) {
      let _ended = ended

      ended = true
      if (wait) setImmediate(wait)

      if (_ended) return log('already ended')

      log('ending')
      socket.end()
    }
  }

  socket.on('data', d => {
    log('read', d)
    q.push(d)
    if (wait) setImmediate(wait)
  })

  socket.on('end', () => {
    log('got end')
    endedSource = true
    ended = true
  })

  return {
    sink: (read) => {
      const next = (end, data) => {
        if (data) {
          log('write', data)
          socket.write(data)
          read(null, next)
        } else if (end) {
          log('sink: send end?')
          endedSink = true
          tryEnd()
        }
      }

      read(null, next)
    },
    source: (end, cb) => {
      if (end) {
        log('source: send end?')
        endedSource = true
        tryEnd()
        return cb(end)
      }

      if (ended) {
        return cb(ended)
      }

      const d = () => {
        wait = null

        if (q.length) {
          let d = q.shift()
          return cb(null, d)
        }

        if (ended) {
          return cb(ended)
        }

        console.error('UTP[%s]: State error in source', addr)
      }

      if (q.length) {
        d()
      } else {
        wait = d
      }
    }
  }
}
