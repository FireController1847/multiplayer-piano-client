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
/******/ 	__webpack_require__.p = "/piano/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 91);
/******/ })
/************************************************************************/
/******/ ({

/***/ 91:
/***/ (function(module, exports, __webpack_require__) {


var exports = (function() {

	var NoteQuota = function(cb) {
		this.cb = cb;
		this.setParams();
		this.resetPoints();
	};

	NoteQuota.PARAMS_LOBBY = {allowance: 200, max: 600};
	NoteQuota.PARAMS_NORMAL = {allowance: 400, max: 1200};
	NoteQuota.PARAMS_RIDICULOUS = {allowance: 600, max: 1800};
	NoteQuota.PARAMS_OFFLINE = {allowance: 8000, max: 24000, histLen: 3};

	NoteQuota.prototype.getParams = function() {
		return {
			m: "nq",
			allowance: this.allowance,
			max: this.max,
			histLen: this.histLen
		};
	};

	NoteQuota.prototype.setParams = function(params) {
		params = params || NoteQuota.PARAMS_OFFLINE;
		var allowance = params.allowance || this.allowance || NoteQuota.PARAMS_OFFLINE.allowance;
		var max = params.max || this.max || NoteQuota.PARAMS_OFFLINE.max;
		var histLen = params.histLen || this.histLen || NoteQuota.PARAMS_OFFLINE.histLen;
		if(allowance !== this.allowance || max !== this.max || histLen !== this.histLen) {
			this.allowance = allowance;
			this.max = max;
			this.histLen = histLen;
			this.resetPoints();
			return true;
		}
		return false;
	};

	NoteQuota.prototype.resetPoints = function() {
		this.points = this.max;
		this.history = [];
		for(var i = 0; i < this.histLen; i++)
			this.history.unshift(this.points);
		if(this.cb) this.cb(this.points);
	};

	NoteQuota.prototype.tick = function() {
		// keep a brief history
		this.history.unshift(this.points);
		this.history.length = this.histLen;
		// hook a brother up with some more quota
		if(this.points < this.max) {
			this.points += this.allowance;
			if(this.points > this.max) this.points = this.max;
			// fire callback
			if(this.cb) this.cb(this.points);
		}
	};

	NoteQuota.prototype.spend = function(needed) {
		// check whether aggressive limitation is needed
		var sum = 0;
		for(var i in this.history) {
			sum += this.history[i];
		}
		if(sum <= 0) needed *= this.allowance;
		// can they afford it?  spend
		if(this.points < needed) {
			return false;
		} else {
			this.points -= needed;
			if(this.cb) this.cb(this.points); // fire callback
			return true;
		}
	};

	return NoteQuota;

})();

if(true) {
	module.exports = exports;
} else {}


/***/ })

/******/ });