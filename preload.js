const ipc = require('electron').ipcRenderer

function sendComplete () {
    ipc.send('complete', true)
}

function sendUUID (uuid) {
    ipc.send('setUUID', uuid)
}

window.sendComplete = sendComplete;
window.sendUUID = sendUUID;