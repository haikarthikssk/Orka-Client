'use strict'

let statsProvider = (function () {
  let instance = null
  let statsData = {}
  let statsTimer = null
  function initialize () {
    const systemInfo = require('systeminformation')
    const diskUsage = require('diskusage')
    const rootPath = require('os').platform() === 'win32' ? 'c' : '/'
    function start (interval) {
      statsData['temperature'] = 0

      statsTimer = setInterval(() => {
        // statsData['ram'] = 100 - (Math.round(osUtils.freememPercentage() * 100))

        systemInfo.currentLoad(function (data) {
          statsData['cpu'] = Math.round(data.currentload)
        })

        systemInfo.mem((data) => {
          statsData['ram'] = Math.round((data.used / data.total) * 100)
        })

        systemInfo.cpuTemperature(function (data) {
          if (data.main > 0) {
            statsData['temperature'] = data.main
          }
        })

        diskUsage.check(rootPath, (err, data) => {
          if (err) {
            console.log(err)
            return
          }
          statsData['disk'] = Math.round(((data.total - data.free) / data.total) * 100)
        })
      }, interval)
    }

    function getStats () {
      return statsData
    }
    function stop () {
      clearInterval(statsTimer)
    }
    function getSystemInfo () {
      return systemInfo.getStaticData()
    }

    return {
      getStats: getStats,
      startMonitoring: start,
      stopMonitoring: stop,
      getSystemInfo
    }
  }

  return {
    getInstance: function () {
      if (instance == null) {
        instance = initialize()
      }
      return instance
    }
  }
})()

module.exports = statsProvider.getInstance()
