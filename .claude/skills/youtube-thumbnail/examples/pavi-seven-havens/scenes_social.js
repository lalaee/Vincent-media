// Vertical covers for TikTok (1080x1920) and Instagram (1080x1350 feed / 4:5): same portrait, caption on top, arrow down.
// 9:16: keep caption + face inside the centre 1080x1440 (y 240-1680; the profile grid crops to 3:4) and clear of the
// bottom 320 px (TikTok caption/UI) and right 150 px (buttons). The body bleeds off the bottom.
import { portrait } from './portrait.js';
export default (E) => {
  const { x, W, H } = E;
  function arrow(x0, y0, qx, qy, x1, y1, { w = 7, L = 34, spread = 0.5, color = '#14101A' } = {}) {
    x.save(); x.strokeStyle = color; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo(qx, qy, x1, y1); x.stroke();
    const ang = Math.atan2(y1 - qy, x1 - qx);
    x.beginPath(); x.moveTo(x1 - L * Math.cos(ang - spread), y1 - L * Math.sin(ang - spread)); x.lineTo(x1, y1);
    x.lineTo(x1 - L * Math.cos(ang + spread), y1 - L * Math.sin(ang + spread)); x.stroke(); x.restore();
  }
  // per-format layout: caption baselines, portrait centre/scale, arrow
  const tall = H / W > 1.5;
  const L = tall ? { y1: 420, y2: 580, f1: 124, f2: 172, cx: 520, cy: 1130, s: 1.7, ar: [800, 660, 950, 730, 910, 860] }
                 : { y1: 130, y2: 270, f1: 104, f2: 150, cx: 520, cy: 740, s: 1.5, ar: [790, 360, 920, 410, 880, 510] };
  return {
    d() {
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, H);
      portrait(x, L.cx, L.cy, L.s);
      x.save(); x.fillStyle = '#14101A'; x.textBaseline = 'middle'; x.textAlign = 'center';
      x.font = `400 ${L.f1}px Fredoka, sans-serif`; x.fillText('worst', W / 2 - 120, L.y1);
      x.font = `700 ${L.f2}px Fredoka, sans-serif`; x.fillText('job ever', W / 2 - 20, L.y2); x.restore();
      arrow(...L.ar);
    },
  };
};
