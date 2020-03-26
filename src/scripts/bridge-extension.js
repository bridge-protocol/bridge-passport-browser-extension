const Bridge = require('@bridge-protocol/bridge-protocol-js');

class BridgeExtension {
  constructor(){
    this.SDK = Bridge;
    this.browser = window.msBrowser || window.browser || window.chrome;
  }

  get passportVersion(){
    return this.SDK.Constants.passportVersion;
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
