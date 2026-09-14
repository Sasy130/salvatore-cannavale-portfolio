/** Deterministic, abstract bathymetry. These are artwork, not geographic measurements. */
export function createContours(count = 48): string[] {
  return Array.from({ length: count }, (_, ring) => {
    const points = 180;
    const radius = 48 + ring * 9.1;
    return Array.from({ length: points + 1 }, (_, step) => {
      const angle = (step / points) * Math.PI * 2;
      const distortion = 1 + 0.105 * Math.sin(angle * 3 + ring * 0.027) + 0.058 * Math.cos(angle * 5 - ring * 0.039) + 0.025 * Math.sin(angle * 8);
      const r = radius * distortion;
      const x = 532 + Math.cos(angle) * r * 0.93 + Math.sin(angle * 2) * 22 + ring * 0.8;
      const y = 422 + Math.sin(angle) * r * 0.74 + Math.cos(angle * 3) * 13 - ring * 0.6;
      return `${step === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ") + " Z";
  });
}
