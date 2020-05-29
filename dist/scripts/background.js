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
/******/ 	return __webpack_require__(__webpack_require__.s = "./scripts/background.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./scripts/background.js":
/*!*******************************!*\
  !*** ./scripts/background.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("//Browser for compatibility\nvar _browser = function () {\n  return window.msBrowser || window.browser || window.chrome;\n}(); //Cached passphrase\n\n\nvar _passphrase; //Window tracking\n\n\nvar popupWindowId = false;\nvar windowNotOpenTitle = 'Open Bridge Passport';\nvar windowIsOpenTitle = 'Bridge Passport is already open. Click to focus popup.';\n\nfunction openPopup(pageName, params) {\n  //Default to main\n  if (!pageName) pageName = \"main\"; //Set the window size\n\n  var height = screen.height * .80;\n  var width = screen.width * .50;\n  if (height < 1024) height = screen.height;else if (height > 1024) height = 1024;\n  if (width < 700) width = screen.width;else if (width > 700) width = 700; //Center the window\n\n  hcenter = screen.width * .50;\n  vcenter = screen.height * .50;\n  hoffset = width * .50;\n  voffset = height * .50;\n  var left = hcenter - hoffset;\n  var top = vcenter - voffset;\n  var windowSize = {\n    height,\n    width,\n    left,\n    top\n  };\n\n  var url = _browser.extension.getURL(\"/\" + pageName + \"/\" + pageName + \".html\");\n\n  if (params) url = url + \"?\" + params;\n  console.log(\"Opening Passport window: \" + JSON.stringify({\n    url,\n    windowSize\n  }));\n\n  if (typeof popupWindowId === 'number') {\n    console.log(\"Passport window already open, focusing\");\n\n    _browser.runtime.sendMessage({\n      target: \"popup\",\n      action: \"focus\",\n      url\n    });\n  }\n\n  if (popupWindowId === false) {\n    popupWindowId = true; //Prevent user pressing pressing the button multiple times.\n\n    _browser.browserAction.setTitle({\n      title: windowIsOpenTitle\n    });\n\n    _browser.windows.create({\n      url,\n      type: 'popup',\n      width: windowSize.width,\n      height: windowSize.height,\n      left: windowSize.left,\n      top: windowSize.top\n    }, function (win) {\n      popupWindowId = win.id;\n    });\n  }\n\n  return;\n} //Look for closing popups\n\n\n_browser.windows.onRemoved.addListener(function (winId) {\n  if (popupWindowId === winId) {\n    _browser.browserAction.setTitle({\n      title: windowNotOpenTitle\n    });\n\n    popupWindowId = false;\n  }\n});\n\n_browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {\n  if (request.target != 'background') return;\n\n  if (request.action == \"login\") {\n    console.log(\"login request received\");\n\n    if (popupWindowId === false) {\n      openPopup(\"main\", \"sender=\" + sender.tab.id + \"&login_request=\" + request.detail.loginRequest);\n    } else {\n      _browser.runtime.sendMessage({\n        target: \"popup\",\n        action: \"focus\"\n      });\n\n      _browser.runtime.sendMessage({\n        target: \"popup\",\n        action: \"login\",\n        sender: sender.tab.id,\n        loginRequest: request.detail.loginRequest\n      });\n    }\n\n    return;\n  }\n\n  if (request.action == \"payment\") {\n    console.log(\"paymentrequest received\");\n\n    if (popupWindowId === false) {\n      openPopup(\"main\", \"sender=\" + sender.tab.id + \"&payment_request=\" + request.detail.paymentRequest);\n    } else {\n      _browser.runtime.sendMessage({\n        target: \"popup\",\n        action: \"focus\"\n      });\n\n      _browser.runtime.sendMessage({\n        target: \"popup\",\n        action: \"payment\",\n        sender: sender.tab.id,\n        paymentRequest: request.detail.paymentRequest\n      });\n    }\n\n    return;\n  }\n\n  if (request.action == \"claimsImport\") {\n    console.log(\"claims import request received\");\n\n    _browser.runtime.sendMessage({\n      target: \"popup\",\n      action: \"claimsImport\",\n      sender: sender.tab.id,\n      claimsImportRequest: request.detail.claimsImportRequest\n    });\n  }\n\n  if (request.action == \"openPopup\") {\n    openPopup(request.pageName, request.params);\n    return;\n  }\n\n  if (request.action == \"loadPassphrase\") {\n    sendResponse(_passphrase);\n  }\n\n  if (request.action == \"savePassphrase\") {\n    _passphrase = request.passphrase;\n    sendResponse();\n  }\n\n  if (request.action == \"removePassphrase\") {\n    _passphrase = null;\n    sendResponse();\n  }\n});\n\n//# sourceURL=webpack:///./scripts/background.js?");

/***/ })

/******/ });