const { app, BrowserWindow } = require('electron') // Importing electron
const path = require('path')

// Building the window
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'public/assets/images/gamer-dailies-logo.png') // Change window icon
  })

  win.setMenuBarVisibility(false) // Hide menu bar thats automatically added

  win.loadFile('public/frontend/profile_select.html') // Whatever file will load first on startup

}

// Create the window
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})