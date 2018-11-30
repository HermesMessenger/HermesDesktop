const {app, BrowserWindow} = require('electron')

var mainWindow;

const lock = app.requestSingleInstanceLock()

if (!lock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
};

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 1024, 
    height: 768,
    webPreferences: {
      nodeIntegration: false,
//    preload: './preload.js'
    }
  });

  mainWindow.loadURL('https://hermesmessenger.duckdns.org')

  mainWindow.on('closed', function () {
    //mainWindow.close();
    app.quit();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  };
  mainWindow.maximize()
});

