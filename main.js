const { app, BrowserWindow, Tray, Menu } = require('electron');
const settings = require('electron-settings');
const isOnline = require('is-online');
const request = require('request');

const lock = app.requestSingleInstanceLock();
const appID = 'HermesMessenger.Hermes.Desktop';
app.setAppUserModelId(appID)

var reallyQuit = false;
var mainWindow;
var HermesURL = 'https://hermesmessenger.duckdns.org';
var HermesURL = 'http://localhost:8080'; // Uncomment this to use your local server instead of the main one (useful for testing), but remember to comment it back before pushing.

if (lock) {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        };
    });
} else app.quit();

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1280, height: 720,
        minWidth: 800, minHeight: 600,

        title: 'Hermes Desktop',
        icon: 'build/icon.png',
        show: false,

        'Content-Security-Policy': 'script-src self https://hermesmessenger.duckdns.org/',
        webPreferences: {
            nodeIntegration: false,
        }
    });

    tray = new Tray('build/icon.png'); // Background service 
    tray.on('click', () => mainWindow.show());
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'Hermes Messenger', enabled: false }, // Title for the context menu
        { label: 'Show App', click: () => mainWindow.show() },
        { label: 'Quit', click: () => {
            reallyQuit = true;
            app.quit();
        } }
    ]));

    mainWindow.loadFile('web/loading.html');
    mainWindow.maximize();
    mainWindow.show();

    (async () => {  
        if (await isOnline() === true) {
            let uuid = settings.get('uuid');
            if (uuid) {
                mainWindow.loadURL(HermesURL + '/setCookie/' + uuid);
            } else {
                mainWindow.loadFile(HermesURL);
            }
        } else mainWindow.loadFile('web/noInternet.html');
    })();

    mainWindow.on('close', (event) => {
        if (! reallyQuit) {
            event.preventDefault();
            mainWindow.hide();
            event.returnValue = false;
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});

app.on('activate', () => {
    if (mainWindow === null) createWindow()
});
