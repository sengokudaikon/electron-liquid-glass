// import { app, BrowserWindow } from "electron";
// import myAddon from "../js";
const { app, BrowserWindow, screen, ipcMain } = require("electron");
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
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Once the DOM/renderer is ready show the glass effect
  mainWindow.webContents.once("did-finish-load", () => {
    try {
      global.viewId = myAddon.addView(mainWindow.getNativeWindowHandle());
      mainWindow.setWindowButtonVisibility(true); // restore traffic lights

      // Inform renderer that glass view is ready
      mainWindow.webContents.send("glass-ready", { viewId: global.viewId });

    } catch (err) {
      console.error("addView failed:", err);
    }
  });
});

// Listen for renderer tweaks
ipcMain.on("glass-set", (_event, { type, value }) => {
  if (typeof global.viewId !== "number") return;
  try {
    switch (type) {
      case "variant":
        myAddon.unstable_setVariant(global.viewId, value);
        break;
      case "scrim":
        myAddon.unstable_setScrim(global.viewId, value);
        break;
      case "subdued":
        myAddon.unstable_setSubdued(global.viewId, value);
        break;
    }
  } catch (err) {
    console.error("glass-set failed", err);
  }
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