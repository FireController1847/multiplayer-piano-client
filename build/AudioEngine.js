/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

class AudioEngine {
  constructor(mpp) {
    this.mpp = mpp;
    this.threshold = 1000;
    this.worker = new Worker('./WorkerTimer.js');
    this.worker.onmessage = event => {
      if (event.data.args) {
        if (event.data.args.action == 0) {
          this.actualPlay(event.data.args.id, event.data.args.vol, event.data.args.time, event.data.args.part_id);
        } else {
          this.actualStop(event.data.args.id, event.data.args.time, event.data.args.part_id);
        }
      }
    };
  }
  init(cb) {
    this.volume = 0.6;
    this.sounds = {};

    this.context = new AudioContext();

    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterGain.gain.value = this.volume;

    this.limiterNode = this.context.createDynamicsCompressor();
    this.limiterNode.threshold.value = -10;
    this.limiterNode.knee.value = 0;
    this.limiterNode.ratio.value = 20;
    this.limiterNode.attack.value = 0;
    this.limiterNode.release.value = 0.1;
    this.limiterNode.connect(this.masterGain);

    // for synth mix
    this.pianoGain = this.context.createGain();
    this.pianoGain.gain.value = 0.5;
    this.pianoGain.connect(this.limiterNode);
    this.synthGain = this.context.createGain();
    this.synthGain.gain.value = 0.5;
    this.synthGain.connect(this.limiterNode);

    this.playings = {};

    if (cb) setTimeout(cb, 0);
    return this;
  }
  load(id, url, cb) {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.responseType = 'arraybuffer';
    req.addEventListener('readystatechange', () => {
      if (req.readyState !== 4) return;
      try {
        this.context.decodeAudioData(req.response, buffer => {
          this.sounds[id] = buffer;
          if (cb) return cb();
        });
      } catch (e) {
        throw new Error(
          `${e.message} / ` +
          `id: ${id} / ` +
          `url: ${url} / ` +
          `status: ${req.status} / ` +
          `ArrayBuffer: ${req.response instanceof ArrayBuffer} / ` +
          `byteLength: ${req.response && req.response.byteLength ? req.response.byteLength : 'undefined'}`
        );
        /* eslint-disable max-len */
        /*
        new Notification({id: "audio-download-error", title: "Problem", text: "For some reason, an audio download failed with a status of " + req.status + ". ",
          target: "#piano", duration: 10000});
        */
        /* eslint-enable max-len */
      }
    });
    req.send();
  }
  actualPlay(id, vol, time, part_id) {
    if (!this.sounds.hasOwnProperty(id)) return;
    const source = this.context.createBufferSource();
    source.buffer = this.sounds[id];
    const gain = this.context.createGain();
    gain.gain.value = vol;
    source.connect(gain);
    gain.connect(this.pianoGain);
    source.start(time);
    // Patch from ste-art remedies stuttering under heavy load
    if (this.playings[id]) {
      const playing = this.playings[id];
      playing.gain.gain.setValueAtTime(playing.gain.gain.value, time);
      playing.gain.gain.linearRampToValueAtTime(0.0, time + 0.2);
      playing.source.stop(time + 0.21);
      // if (enableSynth && playing.voice) {
      //   playing.voice.stop(time);
      // }
    }
    this.playings[id] = { source: source, gain: gain, part_id: part_id };
    // if (enableSynth) {
    //   this.playings[id].voice = new synthVoice(id, time);
    // }
  }
  actualStop(id, time, part_id) {
    if (!this.playings.hasOwnProperty(id) || !this.playings[id] || this.playings[id].part_id !== part_id) return;
    const gain = this.playings[id].gain.gain;
    gain.setValueAtTime(gain.value, time);
    gain.linearRampToValueAtTime(gain.value * 0.1, time + 0.16);
    gain.linearRampToValueAtTime(0.0, time + 0.4);
    this.playings[id].source.stop(time + 0.41);
    if (this.playings[id].voice) this.playings[id].voice.stop(time);
    this.playings[id] = null;
  }
  play(id, vol, delay_ms, part_id) {
    if (!this.sounds.hasOwnProperty(id)) return;
    // Calculate time on note receive.
    const time = this.context.currentTime + (delay_ms / 1000);
    const delay = delay_ms - this.threshold;
    if (delay <= 0) {
      this.actualPlay(id, vol, time, part_id);
    } else {
      // Play, but start scheduling right before play.
      this.worker.postMessage({ delay: delay, args: { action: 0, id: id, vol: vol, time: time, part_id: part_id } });
    }
  }
  stop(id, delay_ms, part_id) {
    const time = this.context.currentTime + (delay_ms / 1000);
    const delay = delay_ms - this.threshold;
    if (delay <= 0) {
      this.actualStop(id, time, part_id);
    } else {
      // Stop
      this.worker.postMessage({ delay: delay, args: { action: 1, id: id, time: time, part_id: part_id } });
    }
  }
  setVolume(vol) {
    this.volume = vol;
    this.masterGain.gain.value = this.volume;
  }
}

module.exports = AudioEngine;

/***/ })
/******/ ]);