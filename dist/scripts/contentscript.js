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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./scripts/contentscript.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./scripts/contentscript.js":
/*!**********************************!*\
  !*** ./scripts/contentscript.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {\n  var res = null;\n\n  if (request.action == 'sendBridgeLoginResponse') {\n    var loginResponse = request.loginResponse;\n    var event = new CustomEvent(\"bridge-protocol-login-response\", {\n      detail: loginResponse\n    });\n    document.dispatchEvent(event);\n  }\n\n  if (request.action == 'sendBridgePaymentResponse') {\n    var paymentResponse = request.paymentResponse;\n    var event = new CustomEvent(\"bridge-protocol-payment-response\", {\n      detail: paymentResponse\n    });\n    document.dispatchEvent(event);\n  }\n\n  sendResponse(res);\n});\ndocument.addEventListener(\"bridge-protocol-login-request\", function (data) {\n  if (!data.detail.loginRequest) {\n    alert(\"loginRequest was not provided\");\n    return;\n  }\n\n  console.log('Bridge Protocol Content Script: Login request received: ' + JSON.stringify(data.detail));\n  chrome.runtime.sendMessage({\n    target: \"background\",\n    action: \"login\",\n    detail: data.detail\n  });\n});\ndocument.addEventListener(\"bridge-protocol-payment-request\", function (data) {\n  if (!data.detail.paymentRequest) {\n    alert(\"paymentRequest was not provided\");\n    return;\n  }\n\n  console.log('Bridge Protocol Content Script: Payment request received: ' + JSON.stringify(data.detail));\n  chrome.runtime.sendMessage({\n    target: \"background\",\n    action: \"payment\",\n    detail: data.detail\n  });\n});\ndocument.addEventListener(\"bridge-protocol-claims-import-request\", function (data) {\n  if (!data.detail.claimsImportRequest) {\n    alert(\"claimsImportRequest was not provided\");\n    return;\n  }\n\n  console.log('Bridge Protocol Content Script: Claims import request received: ' + JSON.stringify(data.detail));\n  chrome.runtime.sendMessage({\n    target: \"background\",\n    action: \"claimsImport\",\n    detail: data.detail\n  });\n}); //Wait for window load and set a window variable to the current Bridge Passport Version\n\ndocument.addEventListener('readystatechange', function (event) {\n  if (document.readyState === 'complete') {\n    try {\n      var manifestData = chrome.runtime.getManifest();\n      var script = document.createElement('script');\n      script.text = \"window.bridgePassportVersion='\" + manifestData.version + \"';\";\n      document.documentElement.appendChild(script);\n    } catch (err) {\n      console.log(err);\n    }\n  }\n});\n\n//# sourceURL=webpack:///./scripts/contentscript.js?");

/***/ })

/******/ });