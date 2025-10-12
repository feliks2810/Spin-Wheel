
// Pure math helpers for playground wheel rotation <-> index mapping
// These functions are independent of DOM so they can be unit-tested easily.
export function sliceAngle(count) {
  return 360 / count;
}

export function targetMidDegForIndex(count, index) {
  const s = sliceAngle(count);
  // drawWheel places midpoint at (i*slice + slice/2) - 90
  return (index * s + s / 2) - 90;
}

export function rotationToBringMidToPointer(targetMidDeg) {
  // To bring the midpoint to the top pointer (0deg), rotate by -targetMidDeg
  return -targetMidDeg;
}

export function normalizeDeg(d) {
  return ((d % 360) + 360) % 360;
}

export function indexFromRenderedRotation(actualNormalized, count) {
  const s = sliceAngle(count);
  // Derived from mapping in playground: rawIndex = ((90 - actualNormalized)/slice) - 0.5
  const rawIndex = ((90 - actualNormalized) / s) - 0.5;
  // Add a tiny epsilon before floor to mitigate floating point rounding (e.g. 0.999999 -> 1)
  const eps = 1e-9;
  const floored = Math.floor(rawIndex + eps);
  // floor and normalize to [0,count)
  return ((floored % count) + count) % count;
}
