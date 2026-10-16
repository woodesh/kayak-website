// ==========================================================================
// Kayak website installer platform selection
// ==========================================================================

// Official Cloudflare R2 Release Endpoints
const DOWNLOAD_CONFIG = {
  version: "0.19.1",
  macArm: "https://download-kayak.kuanshi.top/kayak/desktop/latest/Kayak-darwin-arm64.dmg",
  macIntel: "https://download-kayak.kuanshi.top/kayak/desktop/latest/Kayak-darwin-x64.dmg",
  win64: "https://download-kayak.kuanshi.top/kayak/desktop/latest/Kayak-win32-x64.exe",
};

// Auto Platform Detection
function detectPlatform() {
  const userAgent = (navigator.userAgent || "").toLowerCase();
  const platform = (navigator.platform || "").toLowerCase();

  if (userAgent.includes("mac") || platform.includes("mac")) {
    let isArm = false;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
          if (renderer.includes("apple") || renderer.includes("m1") || renderer.includes("m2") || renderer.includes("m3") || renderer.includes("m4")) {
            isArm = true;
          }
        }
      }
    } catch (_) {}

    if (isArm || !userAgent.includes("intel")) {
      return {
        os: "macos-arm",
        name: "macOS (Apple Silicon)",
        url: DOWNLOAD_CONFIG.macArm,
      };
    } else {
      return {
        os: "macos-intel",
        name: "macOS (Intel)",
        url: DOWNLOAD_CONFIG.macIntel,
      };
    }
  }

  if (userAgent.includes("win") || platform.includes("win")) {
    return {
      os: "windows",
      name: "Windows (64-bit)",
      url: DOWNLOAD_CONFIG.win64,
    };
  }

  return {
    os: "macos-arm",
    name: "macOS (Apple Silicon)",
    url: DOWNLOAD_CONFIG.macArm,
  };
}
