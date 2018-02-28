// Require CSS
require('../css/index.css');
// // Require JS
const MPP = require('./MPP.js');
// Animation Frame
window.requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (cb => { setTimeout(cb, 1000 / 30); });
// Export Multiplayer Piano
window.MPP = new MPP();