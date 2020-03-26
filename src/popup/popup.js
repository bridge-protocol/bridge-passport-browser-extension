import Vue from 'vue'
import App from './App'

window.$ = require('jquery');
window.jQuery = window.$;
window.Bridge = require('@bridge-protocol/bridge-protocol-js');
window.Extension = require("../scripts/bridge-extension").BridgeExtension;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
});

$(function () {
	Init();
});

async function Init(){
  alert(Bridge.Constants.passportVersion);
  Extension.loadPage("main", null, true);
	window.close();
}
