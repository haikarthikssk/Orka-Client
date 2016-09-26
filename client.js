
// const app = require('express')()
'use strict'
const piClient = require('./piClient.js')
const tty = require('tty.js')
let client = null
const io = require('socket.io')

const port = process.argv.length > 2 ? process.argv[2] : 1993

const cc = tty.createServer({ shell: 'bash', port: port, localOnly: false })
const cloudcmd = require('cloudcmd')
const socket = io.listen(cc, {
  path: '/cloud/socket.io'
})

cc.get('/cloud/*', cloudcmd({
  socket: socket,
  config: {
    prefix: '/cloud'
  }
}))
cc.put('/cloud/*', cloudcmd({
  socket: socket,
  config: {
    prefix: '/cloud'
  }
}))
cc.delete('/cloud/*', cloudcmd({
  socket: socket,
  config: {
    prefix: '/cloud'
  }
}))
cc.post('/connect', function (req, res) {
  let data = ''
  req.on('data', (chunk) => { data += chunk })
  req.on('end', () => {
    let connectionString = JSON.parse(data)
    if (client != null) {
      client.stop()
      client = null
    }
    client = new piClient(connectionString.settings,connectionString.name)
    client.start()
  })
})
console.log('Orka Client is listening on port ' + port)
cc.listen(port)
