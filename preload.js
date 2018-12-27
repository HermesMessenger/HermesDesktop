const ipc = require('electron').ipcRenderer

function get (version) {
    version = ipc.sendSync('get', version);
    return version;
}

function close () {
    ipc.send('close', true)
}

function sendComplete () {
    ipc.send('complete', true)
}

function sendUUID (uuid) {
    ipc.send('setUUID', uuid)
}

window.ipc = ipc;
window.get = get;
window.close = close;
window.sendComplete = sendComplete;
window.sendUUID = sendUUID;