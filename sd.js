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

function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function generateYTicks(maxProb) {
  const maxValue = maxProb > 0 ? maxProb : 1;
  const ticks = Array.from({ length: 5 }, (_, i) => (maxValue * i) / 4);
  return { ticks, maxValue };
}

function generateSuperscript(exp) {
  const map = {
    '-': '\u207b',
    '0': '\u2070',
    '1': '\u00b9',
    '2': '\u00b2',
    '3': '\u00b3',
    '4': '\u2074',
    '5': '\u2075',
    '6': '\u2076',
    '7': '\u2077',
    '8': '\u2078',
    '9': '\u2079'
  };
  return String(exp)
    .split('')
    .map((c) => map[c] ?? c)
    .join('');
}

function drawAxesOnly(
  ctx,
  {
    xMin,
    xMax,
    marginLeft,
    marginTop,
    innerWidth,
    innerHeight,
    width,
    height,
    yTicks = [0, 0.25, 0.5, 0.75, 1],
    yMax = 1,
    marginRight = 16,
    marginBottom = 40,
    yLabel = 'Вероятность'
  }
) {
  const xMinEdge = xMin - 0.5;
  const xMaxEdge = xMax + 0.5;
  const xRange = xMaxEdge - xMinEdge || 1;
  void height;
  void marginBottom;

  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop + innerHeight);
  ctx.lineTo(width - marginRight, marginTop + innerHeight);
  ctx.stroke();

  ctx.fillStyle = '#444';
  ctx.font = '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const labelValues = generateXTicks({ min: xMin, max: xMax }, innerWidth);
  const stepForFormat = labelValues.length >= 2 ? Math.abs(labelValues[1] - labelValues[0]) : 1;
  const decimals = stepForFormat >= 1 ? 0 : Math.max(0, Math.min(6, Math.ceil(-Math.log10(stepForFormat))));
  const formatTick = (value) => {
    if (decimals === 0) return Math.round(value).toString();
    return Number(value.toFixed(decimals)).toString();
  };

  for (const value of labelValues) {
    const x = marginLeft + ((value - xMinEdge) / xRange) * innerWidth;
    const label = formatTick(value);
    ctx.fillText(label, x, marginTop + innerHeight + 6);
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (const prob of yTicks) {
    const y = marginTop + innerHeight - (prob / yMax) * innerHeight;
    ctx.fillText(`${(prob * 100).toFixed(2)}%`, marginLeft - 8, y);
  }

  ctx.save();
  const yLabelX = Math.max(4, marginLeft - 74);
  ctx.translate(yLabelX, marginTop + innerHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
