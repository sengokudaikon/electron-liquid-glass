const EventEmitter = require("events");

// Load the native addon using the 'bindings' module
// This will look for the compiled .node file in various places
const native = require("./native-loader.cjs");
const child_process = require("child_process");

// Create a nice JavaScript wrapper
class LiquidGlass extends EventEmitter {
  constructor() {
    super();
    if (process.platform !== "darwin") {
      console.warn(
        "electron-liquid-glass only supports macOS – liquid glass functionality will be disabled."
      );
      return;
    }

    // Check the major macOS version (e.g. 14.x, 13.x)
    const macosVersion = Number(
      child_process
        .execSync("sw_vers -productVersion")
        .toString()
        .trim()
        .split(".")[0]
    );

    if (macosVersion < 26) {
      console.warn(
        "electron-liquid-glass requires macOS 26 or higher – liquid glass functionality will be disabled."
      );
      return;
    }

    try {
      this._addon = new native.LiquidGlassNative();
    } catch (err) {
      console.error(
        "electron-liquid-glass failed to load its native addon – liquid glass functionality will be disabled.",
        err
      );
    }
  }

  /**
   * Wrap the Electron window with a glass / vibrancy view.
   * @param {Buffer} handle BrowserWindow.getNativeWindowHandle()
   * @param {{cornerRadius?:number,tintColor?:string}} options
   * @returns {number} id – can be used for future API (remove/update)
   */
  addView(handle, options = {}) {
    if (!Buffer.isBuffer(handle)) {
      console.error("electron-liquid-glass: handle must be a Buffer");
      return -1;
    }

    if (!this._addon) {
      console.warn(
        "electron-liquid-glass is unavailable on this platform – addView will be a no-op."
      );
      return -1;
    }

    return this._addon.addView(handle, options);
  }
}

// Export a singleton instance
if (process.platform === "darwin") {
  module.exports = new LiquidGlass();
} else {
  // Provide a fallback for unsupported platforms
  console.warn("Native addon not supported on this platform");

  module.exports = {
    addView: (buffer, options = {}) => {
      throw new Error("Native addon not supported on this platform");
    },
  };
}
