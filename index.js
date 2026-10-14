const { app, BrowserWindow } = require('electron') // Importing electron
const path = require('path')

// Building the window
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'public/assets/images/gamer-dailies-logo.png')
  })

  win.setMenuBarVisibility(false) // Hide menu bar thats automatically added

  win.loadFile('public/frontend/profile_select.html') // Whatever file will load first on startup

  // I will probably need some script in the future to load the users profile pic and username
  // on the profile select page. Also means I gotta store it somewhere on the users device probably
  // so that it can be used on startup
}

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