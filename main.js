const { app, BrowserWindow, ipcMain, Tray, Menu, systemPreferences} = require('electron');
const settings = require('electron-settings');
const isOnline = require('is-online');
const path = require('path')

const lock = app.requestSingleInstanceLock();
app.setAppUserModelId('HermesMessenger.Hermes.Desktop')

var reallyQuit = false;
var mainWindow;
var HermesURL = 'https://hermesmessenger.duckdns.org';
// var HermesURL = 'http://localhost:8080'; // Uncomment this to use your local server instead of the main one (useful for testing), but remember to comment it back before pushing.

var icon = path.join(__dirname, 'icons/Icon.png');

if (process.platform === 'darwin'){
  icon = path.join(__dirname, 'icons/Icon_osxTemplate.png');
};


if (lock) {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    };
  });
} else app.quit();

app.on('ready', () => {

  if (settings.get('firstRunComplete')) {

    mainWindow = new BrowserWindow({
      width: 1280, height: 720,
      minWidth: 800, minHeight: 600,
      icon: icon,

      title: 'Hermes Desktop',
      show: false,

      'Content-Security-Policy': 'script-src self https://hermesmessenger.duckdns.org/',
      webPreferences: {
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    tray = new Tray(icon); // Background service 
    tray.on('click', () => mainWindow.show());
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Hermes Messenger', enabled: false }, // Title for the context menu
      {type: 'separator'},
      { label: 'Show App', click: () => mainWindow.show() },
      { label: 'Close App', click: () => {
          reallyQuit = true;
          app.quit();
        }
      }
    ]));

    mainWindow.loadFile('./web/loading.html');
    mainWindow.maximize();
    mainWindow.show();

    (async () => {
      if (await isOnline()) {
        uuid = settings.get('uuid');
        let theme = 'light';
        if (process.platform == 'darwin') {            
            theme = systemPreferences.isDarkMode() ? 'dark' : 'light';
        }
        mainWindow.loadURL(HermesURL + '/setCookie/' + uuid + '/' + theme); // API call that saves cookie on the client. It redirects to /chat if the UUID is valid and to /login if it isn't.
      } else mainWindow.loadFile('./web/noInternet.html');
    })();

    mainWindow.on('close', (event) => {
      if (!reallyQuit) {
        event.preventDefault();
        mainWindow.hide();
        event.returnValue = false;
      }
    });

  } else {

    mainWindow = new BrowserWindow({
      width: 1280, height: 720,
      resizable: false,
      icon: icon,

      title: 'Hermes Desktop',

      'Content-Security-Policy': 'script-src self',
      webPreferences: {
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    mainWindow.loadFile('web/tutorialPage/index.html');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', () => {
  if (mainWindow === null) createWindow()
});

ipcMain.on('complete', (event, arg) => {
  settings.set('firstRunComplete', true)
  app.relaunch()
  app.exit()
});

ipcMain.on('setUUID', (event, arg) => {
  settings.set('uuid', arg)
});
