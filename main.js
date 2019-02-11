const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron')

let mainWindow;
//app icon path
const iconpath = ('./icon.png')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow)

//create new MainWindow on app open 
function createWindow() {
    mainWindow = new BrowserWindow({ width: 800, height: 600, icon: iconpath })


    // and load the index.html of the app.
    mainWindow.loadFile('index.html')



    //quit app on close
    mainWindow.on('close', function () {
        app.quit();
    })
    //minimizes to tray
    mainWindow.on('minimize', function (event) {
        event.preventDefault()
        mainWindow.hide()
    })

    mainWindow.on('show', function () {
        appIcon.setHighlightMode('always')
    })

    const appIcon = new Tray(iconpath)
    //app settings when minimzed
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: function () {
                mainWindow.show()
            }
        },
        {
            label: 'Quit', click: function () {
                app.isQuiting = true
                app.quit()
            }
        },



    ])
    //open from tray when double clicked the icon
    appIcon.on('double-click', () => {
        mainWindow.show()
    })
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          app.quit()
        }
      })
    appIcon.setContextMenu(contextMenu)

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);

}


const mainMenuTemplate = [
    // Each object is a dropdown
    {
        label: 'File',
        submenu: [
            {
                label: 'Settings',
                click() {
                    createSettingsWindow();
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// If OSX, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                role: 'reload'
            },
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    });
}


function createSettingsWindow() {
    settingsWindow = new BrowserWindow({ width: 300, height: 200, title: "settings", frame: false })
    settingsWindow.loadFile('settings.html')
    // Handle garbage collection
    settingsWindow.on('close', function () {
        settingsWindow = null;
    });
};
//Catches settingsAdd and changes the settings -> closes window
ipcMain.on('settingsSave', function(e, msg){
    console.log(msg)
    settingsWindow.close(); 

  });

  