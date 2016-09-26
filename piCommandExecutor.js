
let commandExecutor = (function() {

  const execAsync = require('child_process').exec

  let spawnedProcess = []

  function executeCommandSync (command, callback) {
    let child = execAsync(command, (error, stdout, stderr) => {
      spawnedProcess.pop(this)

      if (error) {
        console.log(error)
        callback({status: 'error', message: error.message, command: command, time: new Date()})
        return
      }

      if (stdout !== '') {
        callback({status: 'stdout', message: stdout, command: command, time: new Date()})
      }
      else {
        callback({status: 'stderr', message: stderr, command: command, time: new Date()})
      }
    })
    spawnedProcess.push(child)
  }
  function getSpawnedProcess () {
    return spawnedProcess
  }

  return {
    executeCommandSync: executeCommandSync,
    getSpawnedProcess: getSpawnedProcess
  }
})

module.exports = commandExecutor
