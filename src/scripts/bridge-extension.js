//const _bridge = require('@bridge-protocol/bridge-protocol-js');
//const _bridge = require('./bridgeprotocol-sdk');

class BridgeExtension {
  constructor(){
    this.browser = window.msBrowser || window.browser || window.chrome;
  }

  //Page navigation
  loadPage(pageName, params, popup) {
    if (popup) {
      this.browser.runtime.sendMessage({ target: 'background', action: 'openPopup', params, pageName });
    }
    else {
      let url = "../pages/" + pageName + "/" + pageName + ".html";
      if (params)
        url = url + "?" + params;
  
      location.href = url;
    }
  }
}

exports.BridgeExtension = new BridgeExtension();
