const ipc = require('electron').ipcRenderer

function get (version) {
    version = ipc.sendSync('get', version)
    return version
}

function close () {
    ipc.send('close', true)
}

function sendUUID (uuid) {
    ipc.send('setUUID', uuid)
}

function sendComplete () {
    ipc.send('complete', true)
}

function getSettings () {
    settings = ipc.sendSync('getSettings')
    return settings
}

function sendSettings (settings) {
    ipc.send('saveSettings', settings)
}

window.ipc = ipc;
window.get = get;
window.close = close;
window.sendUUID = sendUUID;
window.sendComplete = sendComplete;
window.getSettings = getSettings;
window.sendSettings = sendSettings;