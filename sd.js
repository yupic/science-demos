function generateXTicks(domain, widthPx, minLabelGapPx = 34) {
  const width = Math.max(0, widthPx);
  const maxLabels = Math.floor(width / minLabelGapPx);
  if (maxLabels < 2) return [];

  const range = Math.abs(domain.max - domain.min);
  if (range === 0) return [domain.min];

  const targetLabels = Math.min(maxLabels, 31);
  let rawStep = range / (targetLabels - 1);
  const m = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const x = rawStep / m;
  let niceBase;
  if (x <= 1) niceBase = 1;
  else if (x <= 2) niceBase = 2;
  else if (x <= 5) niceBase = 5;
  else niceBase = 10;
  let step = Math.max(1, niceBase * m);

  const buildTicks = () => {
    const ticks = [];
    const start = Math.ceil(domain.min / step) * step;
    for (let v = start; v <= domain.max + step * 0.001; v += step) {
      const rounded = Number((Math.round(v / step) * step).toFixed(10));
      ticks.push(rounded);
    }
    return ticks;
  };

  let ticks = buildTicks();
  if (ticks.length > maxLabels) {
    step *= 2;
    ticks = buildTicks();
  }
  return ticks;
}
