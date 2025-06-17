import { EventEmitter } from "events";
import { execSync } from "child_process";

// Load the native addon using the 'bindings' module
// This will look for the compiled .node file in various places
import native from "./native-loader.js";

export interface GlassOptions {
  cornerRadius?: number;
  tintColor?: string;
}

export interface LiquidGlassNative {
  addView(handle: Buffer, options: GlassOptions): number;
  setVariant(id: number, variant: number): void;
  setScrimState(id: number, scrim: number): void;
  setSubduedState(id: number, subdued: number): void;
}

// Create a nice JavaScript wrapper
class LiquidGlass extends EventEmitter {
  private _addon?: LiquidGlassNative;

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
      execSync("sw_vers -productVersion").toString().trim().split(".")[0]
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
   * @param handle BrowserWindow.getNativeWindowHandle()
   * @param options Glass effect options
   * @returns id – can be used for future API (remove/update)
   */
  addView(handle: Buffer, options: GlassOptions = {}): number {
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

  private setVariant(id: number, variant: number): void {
    // internal use
    if (!this._addon || typeof this._addon.setVariant !== "function") return;
    this._addon.setVariant(id, variant);
  }

  // public
  unstable_setVariant(id: number, variant: number): void {
    this.setVariant(id, variant);
  }

  unstable_setScrim(id: number, scrim: number): void {
    if (!this._addon || typeof this._addon.setScrimState !== "function") return;
    this._addon.setScrimState(id, scrim);
  }

  unstable_setSubdued(id: number, subdued: number): void {
    if (!this._addon || typeof this._addon.setSubduedState !== "function")
      return;
    this._addon.setSubduedState(id, subdued);
  }
}

// Export a singleton instance
let liquidGlass: LiquidGlass;

if (process.platform === "darwin") {
  liquidGlass = new LiquidGlass();
} else {
  // Provide a fallback for unsupported platforms
  console.warn("Native addon not supported on this platform");

  liquidGlass = {
    addView: (buffer: Buffer, options: GlassOptions = {}): number => {
      throw new Error("Native addon not supported on this platform");
    },
    setVariant: (): void => {},
    unstable_setVariant: (): void => {},
    unstable_setScrim: (): void => {},
    unstable_setSubdued: (): void => {},
  } as any;
}

// Export the default as a singleton instance
export default liquidGlass;

// For CommonJS compatibility, also assign to module.exports
// This helps avoid the "Incorrect default export" TypeScript error
if (typeof module !== "undefined" && module.exports) {
  module.exports = liquidGlass;
  module.exports.default = liquidGlass;
}
