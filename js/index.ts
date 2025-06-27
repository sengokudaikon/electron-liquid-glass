import { EventEmitter } from "events";
import { execSync } from "child_process";
import { GlassMaterialVariant } from "./variants.js";

// Load the native addon using the 'bindings' module
// This will look for the compiled .node file in various places
import native from "./native-loader.js";

export interface GlassOptions {
  cornerRadius?: number;
  tintColor?: string;
  opaque?: boolean;
}

export interface LiquidGlassNative {
  addView(handle: Buffer, options: GlassOptions): number;
  setVariant(id: number, variant: GlassMaterialVariant): void;
  setScrimState(id: number, scrim: number): void;
  setSubduedState(id: number, subdued: number): void;
}

// Create a nice JavaScript wrapper
class LiquidGlass extends EventEmitter {
  private _addon?: LiquidGlassNative;

  // Instance property for easy access to variants
  readonly GlassMaterialVariant: typeof GlassMaterialVariant =
    GlassMaterialVariant;

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

  private setVariant(id: number, variant: GlassMaterialVariant): void {
    // internal use
    if (!this._addon || typeof this._addon.setVariant !== "function") return;
    this._addon.setVariant(id, variant);
  }

  // public
  unstable_setVariant(id: number, variant: GlassMaterialVariant): void {
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

// Create and export the singleton instance
// The class constructor handles platform checks internally
const liquidGlass: LiquidGlass = new LiquidGlass();

export default liquidGlass;
