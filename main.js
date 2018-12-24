const { app, BrowserWindow, ipcMain, Tray, Menu, systemPreferences } = require('electron');
const settings = require('electron-settings');
const isOnline = require('is-online');
const path = require('path');
const request = require('request');

app.setAppUserModelId('HermesMessenger.Hermes.Desktop')

var reallyQuit = false;
var mainWindow;
var HermesURL = 'http://hermesmessenger.duckdns.org';
// var HermesURL = 'http://hermesmessenger-testing.duckdns.org'; // Testing server
// var HermesURL = 'http://localhost:8080'; // Uncomment this to use your local server instead of the main one (useful for testing), but remember to comment it back before pushing.

var icon = path.join(__dirname, 'icons/Icon.png');
if (process.platform === 'darwin') {
    icon = path.join(__dirname, 'icons/Icon_osxTemplate.png');
};

app.on('ready', () => {

    if (settings.get('firstRunComplete')) { // Introduction Complete

        mainWindow = new BrowserWindow(MainMenu);

        tray = new Tray(icon); // Background service 
        tray.on('click', () => mainWindow.show());
        tray.setContextMenu(Menu.buildFromTemplate(trayMenu));

        mainWindow.loadFile('./web/loading.html');
        mainWindow.maximize();
        mainWindow.show();
            
        isOnline().then(online => {
            if (online) { // Device is connected to the Internet
                request.get(HermesURL, (err, res) => { 
                    if (!err && (res.statusCode == 200 || res.statusCode == 301)) { // Device can connect to Hermes, main code goes here

                        let uuid = settings.get('uuid');
                        let theme = systemPreferences.isDarkMode() ? 'dark' : 'light';
                        mainWindow.loadURL(HermesURL + '/setCookie/' + uuid + '/' + theme); // API call that saves cookie on the client. It redirects to /chat if the config is valid and to /login if it isn't.

                    } else mainWindow.loadFile('./web/error.html'); // Error connecting to Hermes server
                }).on('error', () => mainWindow.loadFile('./web/error.html'));

            } else mainWindow.loadFile('./web/noInternet.html');
        }).catch(err => mainWindow.loadFile('./web/noInternet.html'))

        mainWindow.on('close', (event) => {
            if (!reallyQuit) {
                event.preventDefault();
                mainWindow.hide();
                event.returnValue = false;
            }
        });

    } else { // Introduction not complete
        mainWindow = new BrowserWindow(TutorialMenu);
        mainWindow.loadFile('web/tutorialPage/index.html');
    }
});

app.on('activate', () => {
    if (mainWindow === null) createWindow()
});

app.on('before-quit', () => reallyQuit = true);

/*
 __  __ _____ _   _ _   _ ____  
|  \/  | ____| \ | | | | / ___| 
| |\/| |  _| |  \| | | | \___ \ 
| |  | | |___| |\  | |_| |___) |
|_|  |_|_____|_| \_|\___/|____/ 

*/

const MainMenu = {
    width: 1280, height: 720,
    minWidth: 800, minHeight: 600,
    icon: icon,

    title: 'Hermes Desktop',
    show: false,

    'Content-Security-Policy': 'script-src self ' + HermesURL,
    webPreferences: {
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js')
    }
}

const TutorialMenu = {
    width: 1280, height: 720,
    resizable: false,
    icon: icon,

    title: 'Hermes Desktop',

    'Content-Security-Policy': 'script-src self',
    webPreferences: {
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js')
    }
}

const trayMenu = [
    { label: 'Hermes Messenger', enabled: false }, // Title for the context menu
    { type: 'separator'},
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Close App', click: () => {
        reallyQuit = true;
        app.quit();
      }
    }
]

/*
 ___ ____   ____ 
|_ _|  _ \ / ___|
 | || |_) | |    
 | ||  __/| |___ 
|___|_|    \____|

*/

ipcMain.on('complete', () => {
    settings.set('firstRunComplete', true)
    app.relaunch()
    app.exit()
});

ipcMain.on('setUUID', (event, arg) => {
    settings.set('uuid', arg)
});
