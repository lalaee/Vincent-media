// Thumbnail scene: white background, detailed portrait on the left, two-word caption on the right, hand-drawn arrow.
// Crop: frame bottom a bit below the shoulders (portrait scale ~1.17, head top near y 30). Bottom-right stays clear (timestamp).
import { portrait } from './portrait.js';
export default (E) => {
  const { x, W, H } = E;
  // Curved arrow from (x0,y0) via control (qx,qy) to tip (x1,y1). The head is built from the curve's END TANGENT
  // (control -> tip), so it always sits on the line's end and points the way the line travels.
  function arrow(x0, y0, qx, qy, x1, y1, { w = 6, L = 30, spread = 0.5, color = '#14101A' } = {}) {
    x.save(); x.strokeStyle = color; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo(qx, qy, x1, y1); x.stroke();
    const ang = Math.atan2(y1 - qy, x1 - qx);
    x.beginPath(); x.moveTo(x1 - L * Math.cos(ang - spread), y1 - L * Math.sin(ang - spread)); x.lineTo(x1, y1);
    x.lineTo(x1 - L * Math.cos(ang + spread), y1 - L * Math.sin(ang + spread)); x.stroke(); x.restore();
  }
  function caption(light, bold) {                 // one light word above, bold words below, lower case, black
    x.save(); x.fillStyle = '#14101A'; x.textBaseline = 'middle'; x.textAlign = 'left';
    x.font = '400 104px Fredoka, sans-serif'; x.fillText(light, 800, 290);
    x.font = '700 132px Fredoka, sans-serif'; x.fillText(bold, 770, 410); x.restore();
  }
  return {
    d() {
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, H);
      portrait(x, 400, 332, 1.17);
      caption('worst', 'job ever');
      arrow(840, 510, 790, 580, 660, 545);
    },
  };
};
