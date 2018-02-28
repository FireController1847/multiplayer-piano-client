const AudioEngine = require('./AudioEngine.js');

class MPP {
  constructor() {
    // Variables
    this.testMode = false;
    this.seeOwnCursor = false;
    // Objects
    this.sounds = {
      path: './audio/default/',
      ext: '.wav.mp3'
    };
    this.defaults = {
      DEFAULT_VELOCITY: 0.5,
      TIMING_TARGET: 1000
    };
    this.handleURLHashes();
    // AudioEngine
    this.audio = new AudioEngine(this);
  }
  handleURLHashes() {
    this.hashes = window.location.hash.toLowerCase().split('#');
    this.hashes.shift();
    this.testMode = this.hashes.includes('test');
    this.seeOwnCursor = this.hashes.includes('seeowncursor');
  }
}

module.exports = MPP;