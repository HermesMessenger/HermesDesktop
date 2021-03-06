const { app, BrowserWindow, ipcMain, Tray, Menu, shell, systemPreferences } = require('electron')
const settings = require('electron-settings')
const isOnline = require('is-online')
const path = require('path')
const request = require('request')
const semver = require('semver')

const lock = app.requestSingleInstanceLock()

const currentVersion = app.getVersion()
var newVersion

app.setAppUserModelId('HermesMessenger.Hermes.Desktop')

var reallyQuit = false
var mainWindow

var HermesURL

var icon = path.join(__dirname, 'icons/Icon.png')
if (process.platform === 'darwin') {
    icon = path.join(__dirname, 'icons/Icon_osxTemplate.png')
}

app.on('ready', () => {

    if (settings.get('firstRunComplete')) { // Introduction Complete

        mainWindow = new BrowserWindow(MainMenu)

        mainWindow.loadFile('./web/loading.html')
        mainWindow.maximize()
        mainWindow.show()

        HermesURL = 'http://hermesmessenger.chat'
        if (settings.get('testing', false))  HermesURL = 'http://testing.hermesmessenger.chat' // Testing server

        // HermesURL = 'http://localhost:8080' // Uncomment this to use your local server instead of the main one (useful for testing), but remember to comment it back before pushing.        

        isOnline().then(online => {
            if (online) { // Device is connected to the Internet
                request.get(HermesURL, (err, res, body) => {
                    if (!err && res.statusCode == 200) { // Device can connect to Hermes, main code goes here

                        let uuid = settings.get('uuid')

                        if (settings.get('logoutOnRestart', false))  uuid = '' // Invalid UUID -> login page 

                        let theme = systemPreferences.isDarkMode() ? 'dark' : 'light'
                        mainWindow.loadURL(HermesURL + '/setCookie/' + uuid + '/' + theme) // API call that saves cookie on the client. It redirects to /chat if the config is valid and to /login if it isn't.

                        if (settings.get('minimize', true)) {
                            tray = new Tray(icon) // Background service 
                            tray.on('click', () => mainWindow.show())
                            tray.setContextMenu(Menu.buildFromTemplate(trayMenu))
                        }

                        if (settings.get('updateCheck', true)) { // Check for updates
                            request.get({
                                url: 'https://api.github.com/repos/HermesMessenger/HermesDesktop/releases/latest',
                                json: true,
                                headers: {
                                    'User-Agent': 'request'
                                }
                            }, (err, res, body) => {

                                if (!err && res.statusCode == 200) {
                                    if (body.tag_name) {
                                        newVersion = body.tag_name
                                        if (semver.gt(newVersion, currentVersion)) {
                                            updateWindow = new BrowserWindow(UpdateMenu)
                                            updateWindow.loadFile('./web/newUpdate.html')

                                            updateWindow.webContents.on('will-navigate', (event, url) => { // Open links in default browser
                                                event.preventDefault()
                                                shell.openExternal(url)
                                            })
                                        }
                                    }
                                }
                            })
                        }
                    } else mainWindow.loadFile('./web/error.html') // Error connecting to Hermes server
                })
            } else mainWindow.loadFile('./web/noInternet.html')
        }).catch(err => mainWindow.loadFile('./web/noInternet.html'))

        mainWindow.webContents.on('new-window', (event, url) => { // Open links in default browser
            event.preventDefault()
            shell.openExternal(url)
        })

        mainWindow.on('close', (event) => {
            if (!reallyQuit) {
                event.preventDefault()
                mainWindow.hide()
                event.returnValue = false
            }
        })

    } else { // Introduction not complete
        tutorialWindow = new BrowserWindow(TutorialMenu)
        tutorialWindow.loadFile('web/tutorialPage/index.html')
    }
})

if (!lock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.show()
            mainWindow.focus()
        }
    })
}

app.on('activate', () => {
    if (mainWindow === null) createWindow()
})

app.on('before-quit', () => reallyQuit = true)

/*
 __  __ _____ _   _ _   _ ____  
|  \/  | ____| \ | | | | / ___| 
| |\/| |  _| |  \| | | | \___ \ 
| |  | | |___| |\  | |_| |___) |
|_|  |_|_____|_| \_|\___/|____/ 

*/

const MainMenu = {
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
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
    width: 1280,
    height: 720,
    resizable: false,
    icon: icon,

    title: 'Hermes Desktop',

    'Content-Security-Policy': 'script-src self',
    webPreferences: {
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js')
    }
}

const UpdateMenu = {
    width: 500,
    height: 300,
    resizable: false,
    maximizable: false,
    fullscreen: false,
    icon: icon,

    title: 'Hermes Desktop',

    'Content-Security-Policy': 'script-src self',
    webPreferences: {
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js')
    }
}

const trayMenu = [{
        label: 'Hermes Messenger',
        enabled: false
    }, // Title for the context menu
    {
        type: 'separator'
    },
    {
        label: 'Show App',
        click: () => mainWindow.show()
    },
    {
        label: 'Close App',
        click: () => {
            reallyQuit = true
            app.quit()
        }
    }
]

const AppMenu = [{
    label: "Application",
    submenu: [{
            label: "About Hermes Desktop",
            selector: "orderFrontStandardAboutPanel:"
        },
        {
            type: "separator"
        },
        {
            label: "Quit",
            accelerator: "Command+Q",
            click: () => {
                reallyQuit = true
                app.quit()
            }
        }
    ]
}, {
    label: "Edit",
    submenu: [{
            label: "Undo",
            accelerator: "CmdOrCtrl+Z",
            selector: "undo:"
        },
        {
            label: "Redo",
            accelerator: "Shift+CmdOrCtrl+Z",
            selector: "redo:"
        },
        {
            type: "separator"
        },
        {
            label: "Cut",
            accelerator: "CmdOrCtrl+X",
            selector: "cut:"
        },
        {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            selector: "copy:"
        },
        {
            label: "Paste",
            accelerator: "CmdOrCtrl+V",
            selector: "paste:"
        },
        {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            selector: "selectAll:"
        }
    ]
}];

if (process.platform === 'darwin') {
    Menu.setApplicationMenu(Menu.buildFromTemplate(AppMenu));
}

/*
 ___ ____   ____ 
|_ _|  _ \ / ___|
 | || |_) | |    
 | ||  __/| |___ 
|___|_|    \____|

*/

ipcMain.on('get', (event, arg) => {
    if (arg == 'current') {
        event.returnValue = currentVersion
    } else if (arg == 'latest') {
        event.returnValue = newVersion.substr(1)
    } else event.returnValue = undefined
})

ipcMain.on('close', () => {
    updateWindow.destroy()
})

ipcMain.on('complete', () => {
    settings.set('firstRunComplete', true)
    app.relaunch()
    app.exit()
})

ipcMain.on('setUUID', (event, arg) => {
    settings.set('uuid', arg)
})

ipcMain.on('saveSettings', (event, arg) => {
    console.log('new setting:', arg.testing)
    settings.set('launchAtBoot', arg.launch_at_boot)
    settings.set('logoutOnRestart', !arg.stay_logged_in)
    settings.set('testing', arg.use_testing)
    settings.set('minimize', arg.minimize)
    settings.set('updateCheck', arg.check_updates)

    app.setLoginItemSettings({
        openAtLogin: arg.launch_at_boot
    })

    app.relaunch()
    app.exit()
})

ipcMain.on('getSettings', (event, arg) => {
    console.log('current setting:', settings.get('testing', false))
    event.returnValue = {
        launch_at_boot: settings.get('launchAtBoot', true),
        stay_logged_in: !settings.get('logoutOnRestart', false),
        testing: settings.get('testing', false),
        minimize: settings.get('minimize', true),
        check_updates: settings.get('updateCheck', true)
    }
})
