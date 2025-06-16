export interface GlassOptions {
  /** Corner radius in points */
  cornerRadius?: number;
  /** Hex string like #RRGGBB or #RRGGBBAA */
  tintColor?: string;
}

export interface LiquidGlass {
  /**
   * Attach a macOS glass (vibrancy) view behind the given BrowserWindow.
   * Returns an integer id that may be used by future APIs.
   */
  addView(handle: Buffer, options?: GlassOptions): number;
}

declare const glass: LiquidGlass;
export = glass;
