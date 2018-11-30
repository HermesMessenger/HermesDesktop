const {app, BrowserWindow, session} = require('electron');
const lock = app.requestSingleInstanceLock();
var appID = 'HermesMessenger.Hermes.Desktop';
var mainWindow;
var HermesURL = 'https://hermesmessenger.duckdns.org';
// var HermesURL = 'http://localhost:8080'; // Uncomment this to use your local server instead of the main one (useful for testing)


app.setAppUserModelId(appID)

if (lock) {
  app.on('second-instance', function() {
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
    icon: 'icons/icon.png',
    show: false, 

    webPreferences: {
      nodeIntegration: false,
    }
  });

  mainWindow.loadURL(HermesURL);
  mainWindow.maximize();
  mainWindow.show();

  mainWindow.on('closed', function () {
    //mainWindow.close();
    app.quit();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  if (mainWindow === null) createWindow()
});
