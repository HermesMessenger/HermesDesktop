const { app, BrowserWindow, session } = require('electron');
const isOnline = require('is-online');
const settings = require('electron-settings');
const request = require('request');


const lock = app.requestSingleInstanceLock();
const appID = 'HermesMessenger.Hermes.Desktop';
app.setAppUserModelId(appID)

var mainWindow;
var HermesURL = 'https://hermesmessenger.duckdns.org';
// var HermesURL = 'http://localhost:8080'; // Uncomment this to use your local server instead of the main one (useful for testing), but remember to comment it back before pushing.

if (lock) {
  app.on('second-instance', function () {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    };
  });
} else app.quit();

app.on('ready', function () {
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

  
  (async () => {
    if (await isOnline() === true) {
      mainWindow.loadURL(HermesURL);
    } else {
      mainWindow.loadFile('web/noInternet.html')
    }
    mainWindow.maximize();
    mainWindow.show();
  })();

  mainWindow.on('closed', function () {
    //mainWindow.close();
    app.quit(); // TODO: Remove this when we add a backgroud service so app doesn't close. 
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  if (mainWindow === null) createWindow()
});
