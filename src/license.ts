const VALID_KEYS = new Set([
  'IC-2026-JMCHOI-CANVAS-PRO',
]);

let licensed = false;

export function initCanvas(options: { licenseKey: string }) {
  if (VALID_KEYS.has(options.licenseKey)) {
    licensed = true;
  } else {
    console.warn('[IntelliCore Canvas] Invalid license key. Get a valid key at https://intellicore.dev');
  }
}

export function isLicensed(): boolean {
  return licensed;
}
