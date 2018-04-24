'use strict'

/* const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream') */

const debug = require('debug')

module.exports = socket => {
  /* socket.on('data', d => console.log(addr, d))
  const dup = toPull.duplex(socket)
  return {
    sink: pull(pull.through(v => { console.log('data [%s] .sink %s', addr, v); return v }, () => {  socket.end(); console.log('end [%s] .sink', addr);  }), dup.sink),
    source: pull(dup.source,pull.through(v => { console.log('data [%s] .source %s', addr, v); return v }, () => { socket.end(); console.log('end [%s] .source', addr); }))
  } */

  let addr = socket.remoteAddress + ':' + socket.remotePort

  let log = debug('libp2p:utp:socket#' + addr) //console.log.bind(console, 'socket#' + addr)

  let endedSource = false
  let endedSink = false
  let ended = false
  let q = []
  let wait

  function tryEnd() {
    if (endedSource && endedSink) {
      if (ended) return
      log('ending')
      socket.end()
      ended = true
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
        tryEnd()
        return cb(end)
      }

      if (ended) {
        return cb(ended)
      }

      const d = () => {
        wait = null
        let d = q.shift()
        return cb(null, d)
      }

      if (q.length) {
        d()
      } else {
        wait = d
      }
    }
  }
}
