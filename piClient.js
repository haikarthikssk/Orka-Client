let piClient = (function (serverOptions, name) {
  const stats = require('./piStatsProvider.js')
  const commandExecutor = require('./piCommandExecutor.js')()
  let client = null

  let timer = null

  function setup () {
    client = require('socket.io-client')('http://' + serverOptions.ip + ':' + serverOptions.port, {
      query: 'client_name=' + name,
      reconnection: false
    })
    client.on('connect', function () {
      console.log('Connected with Server!..')
      start()
      sendSystemInfo()
    })

    client.on('disconnect', function () {
      console.log('Disconencted From Server')
      stop()
    })

    client.on('Command', function (command) {
      console.log(command)
      commandExecutor.executeCommandSync(command, (output) => {
        client.emit('output', output)
      })
    })
  }

  function start () {
    stats.startMonitoring(serverOptions.interval)
    timer = setInterval(function () {
      let statsData = stats.getStats()
      client.emit('stats', statsData)
      analyzeThreasholdLimits(statsData)
    }, serverOptions.interval)
  }
  function sendSystemInfo () {
    new Promise((resolve, reject) => {
      stats.getSystemInfo().then((data) => {
        resolve(data)
      })
    }).then((data) => {
      client.emit('systemInfo', data)
    })
  }

  function stop () {
    clearInterval(timer)
    stats.stopMonitoring()
  }

  function analyzeThreasholdLimits (stats) {
    let threshold = serverOptions.threshold
    let thresHoldParameters = Object.keys(threshold)
    thresHoldParameters.forEach((param) => {
      try {
        if (param in stats) {
          if (stats[param] > threshold[param].value) {
            if (threshold[param].command !== undefined && threshold[param].command !== '') {
              commandExecutor.executeCommandSync(threshold[param].command, (output) => {
                client.emit('output', output)
              })
            }

            if (threshold[param].notify) {
              client.emit('alert', `${param} value exceeded current value : ${stats[param]} threshold value: ${threshold[param].value}`)
            }
          }
        }
      } catch (ex) {
        console.error(ex.message())
      }
    })
  }
  return {
    start: setup,
    stop: stop
  }
})

module.exports = piClient
