export type NumeralStyle = "romen" | "normal" | "minimal";

// Native crop heights preserve each photographed frame's proportions.
const heights: Record<string, number> = {
  "01": 654, "02": 689, "03": 677, "04": 629, "05": 725,
  "06": 637, "07": 671, "08": 727, "09": 679, "10": 676,
  "11": 650, "12": 650, "13": 671, "14": 660, "15": 642,
  "16": 665, "17": 687, "18": 665, "19": 650, "20": 658,
  "21": 672, "22": 677, "23": 663, "24": 646, "25": 684,
  "27": 670, "28": 668, "29": 654, "30": 650, "31": 711,
  "32": 646, "33": 677, "35": 661, "36": 687, "37": 660,
  "38": 753, "39": 650, "40": 663, "41": 735, "42": 611,
  "43": 678, "44": 696, "45": 618, "46": 1075, "47": 790,
  "48": 875, "49": 730, "50": 690, "52": 619, "53": 765,
  "54": 619, "55": 700, "56": 658,
};
const silverCodes = new Set(["04", "22", "23", "25", "27", "28", "29", "30", "31", "35", "36", "39", "46", "48", "49", "52", "54", "56"]);

export function clockSource(code: string, style: NumeralStyle) {
  return `/images/builder-parts/woya/refined-v1/woya-${code}-clock-${style}.webp`;
}

export function clockArtwork(code: string) {
  const height = heights[code];
  if (!height) return null;
  const round = ["53", "55", "56"].includes(code);
  const narrow = ["46", "48"].includes(code);
  const decorative = ["52", "54"].includes(code);
  const radius = code === "56" ? .275 : code === "55" ? .29 : .255;
  const center = code === "56" ? .48 : .5;
  const box = round
    ? [center - radius, .5 - radius, radius * 2, radius * 2]
    : narrow ? [.4, .025, .2, .8]
    : decorative ? [.24, .23, .52, .54] : [.065, .065, .87, .87];
  const [x, y, width, faceHeight] = box;
  return {
    aspect: 646 / height,
    round,
    narrow,
    dark: ["47", "53", "55"].includes(code),
    silver: silverCodes.has(code),
    // Three transparent pixels surround the original crop on every edge.
    left: (3 + x * 640) / 646 * 100,
    top: (3 + y * (height - 6)) / height * 100,
    width: width * 640 / 646 * 100,
    height: faceHeight * (height - 6) / height * 100,
    pivotY: (.5 - y) / faceHeight * 100,
  };
}

export function dialMarkers(style: Exclude<NumeralStyle, "romen">) {
  return Array.from({ length: 12 }, (_, hour) => ({
    hour,
    angle: hour * 30,
    x: 50 + Math.sin(hour * Math.PI / 6) * 39,
    y: 50 - Math.cos(hour * Math.PI / 6) * 39,
    label: style === "normal" && hour % 3 === 0 ? String(hour || 12) : null,
    major: hour % 3 === 0,
  }));
}
