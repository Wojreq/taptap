const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let win;
let tray;
let backendProcess;

function createWindow() {
  win = new BrowserWindow({
    width: 360,
    height: 480,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  win.loadURL('http://localhost:3000');

  win.setMenu(null);

  win.on('close', (e) => {
    e.preventDefault();
    win.hide();
  });
}

function createTray() {
const iconPath = path.join(__dirname, 'icon.ico');

tray = new Tray(iconPath);
const contextMenu = Menu.buildFromTemplate([
  { label: 'Pokaż', click: () => win.show() },
{ label: 'Wyjdź', click: () => {
  app.isQuiting = true;
  if (backendProcess) backendProcess.kill();
  if (win) win.destroy();
  app.quit();
}},
]);
tray.setContextMenu(contextMenu);
tray.setToolTip('Twitch Bot');


  tray.on('double-click', () => {
    if (win) win.show();
  });
}

app.whenReady().then(() => {
  backendProcess = fork(path.join(__dirname, 'server.js'));

  backendProcess.on('error', (err) => {
    console.error('Backend process error:', err);
  });

  backendProcess.on('exit', (code, signal) => {
    console.log(`Backend exited: code ${code}, signal ${signal}`);
  });

  createWindow();
  createTray();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.on('before-quit', () => {
  if (backendProcess) backendProcess.kill();
});
