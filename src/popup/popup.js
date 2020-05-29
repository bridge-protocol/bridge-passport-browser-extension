import Vue from 'vue'
import App from './App'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
});

$(function () {
	Init();
});

async function Init(){
  BridgeExtension.loadPage("main", null, true);
  window.close();
}


