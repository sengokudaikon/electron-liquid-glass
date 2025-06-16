// import { app, BrowserWindow } from "electron";
// import myAddon from "../js";
const { app, BrowserWindow, screen } = require("electron");
const myAddon = require("../js/index.cjs");
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    x: screen.getPrimaryDisplay().workArea.x + screen.getPrimaryDisplay().workArea.width - 800,
    y: screen.getPrimaryDisplay().workArea.y + 100,
    frame: false,
    transparent: true,
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Once the DOM/renderer is ready show the glass effect
  mainWindow.webContents.once("did-finish-load", () => {
    try {
      const viewId = myAddon.addView(mainWindow.getNativeWindowHandle());
      mainWindow.setWindowButtonVisibility(true); // restore traffic lights


    } catch (err) {
      console.error("addView failed:", err);
    }
  });
});



// Standard quit handling
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    /* re-create */
    mainWindow = new BrowserWindow({ width: 800, height: 600 });
    mainWindow.loadFile(path.join(__dirname, "index.html"));
  }
});