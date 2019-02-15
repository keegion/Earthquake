const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron')

let mainWindow;
let settingsWindow;
let mapWindow;
const Store = require('electron-store');
const store = new Store();
//app icon path
const iconpath = ('./icon.png')
let tray;
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow)

//create new MainWindow on app open
function createWindow() {
    mainWindow = new BrowserWindow({ width: 1200, height: 800, icon: iconpath })


    // and load the index.html of the app.
    mainWindow.loadFile('index.html')


    tray = new Tray(iconpath);
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
        tray.setHighlightMode('always')
    })


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
    tray.on('double-click', () => {
        mainWindow.show()
    })
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })
    tray.setContextMenu(contextMenu)

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
                label: 'Refresh',
                click() {
                    mainWindow.reload()
                }
            },
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
    settingsWindow = new BrowserWindow({ width: 300, height: 300, title: "settings", frame: false })
    settingsWindow.loadFile('settings.html')
    // Handle garbage collection
    settingsWindow.on('close', function () {
        settingsWindow = null;
    });
};
function createMapWindow() {
    mapWindow = new BrowserWindow({ width: 600, height: 600, title: "map"})
    mapWindow.setMenuBarVisibility(false)
    mapWindow.loadFile('map.html')
    // Handle garbage collection
    mapWindow.on('close', function () {
        mapWindow = null;
    });
};

//Catches settingsAdd and changes the settings -> closes window
ipcMain.on('settingsSave', function (e, type,range,frequency) {
    console.log("type" + type);
    console.log("range" + range);
    console.log("frequency" + frequency);
    settingsWindow.close();
    setUrl(type,range);
    store.set("frequency",frequency);
    mainWindow.webContents.send("update");

});
ipcMain.on('closeMap', function (e) {

    mapWindow.close();

});

ipcMain.on('openMap', function (e, msg) {

    var arrayOfStrings = msg.split(",")
    createMapWindow();

    mapWindow.webContents.on('did-finish-load', function () {

        mapWindow.webContents.send('sendCoords', arrayOfStrings);
    });



})



ipcMain.on('openNotification', function (e, msg) {


    tray.displayBalloon({
        title: "New earthquake!",
        content: msg,
        icon: iconpath
    })

});

function setUrl(type,range){

    switch(true){
        case type == "Significant" && range == "hour":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson");
        break;
        case type == "Significant" && range == "day":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson");
        break;
        case type == "Significant" && range == "7days":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson");
        break;
        case type == "Significant" && range == "30days":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson");
        break;
        case type == "4.5" && range == "hour":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_hour.geojson");
        break;
        case type == "4.5" && range == "day":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson");
        break;
        case type == "4.5" && range == "7days":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson");
        break;
        case type == "4.5" && range == "30days":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson");
        break;
        case type == "2.5" && range == "hour":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson");
        break;
        case type == "2.5" && range == "day":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson");
        break;
        case type == "2.5" && range == "7days":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson");
        break;
        case type == "2.5" && range == "30days":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson");
        break;
        case type == "1" && range == "hour":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_hour.geojson");
        break;
        case type == "1" && range == "day":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson");
        break;
        case type == "1" && range == "7days":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson");
        break;
        case type == "1" && range == "30days":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson");
        break;
        case type == "All" && range == "hour":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson");
        break;
        case type == "All" && range == "day":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
        break;
        case type == "All" && range == "7days":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson");
        break;
        case type == "All" && range == "30days":
        store.set("url","https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson");
        break;
    
       }
}