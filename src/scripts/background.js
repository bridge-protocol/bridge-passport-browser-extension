//Browser for compatibility
var _browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

//Cached passphrase
var _passphrase;

//Window tracking
var popupWindowId = false;
var windowNotOpenTitle = 'Open Bridge Passport';
var windowIsOpenTitle = 'Bridge Passport is already open. Click to focus popup.';

function openPopup(pageName, params) {
  //Default to main
  if (!pageName)
    pageName = "main";

  //Set the window size
  let height = screen.height * .80;
  let width = screen.width * .50;

  if (height < 1024)
    height = screen.height;
  else if (height > 1024)
    height = 1024;

  if (width < 700)
    width = screen.width;
  else if (width > 700)
    width = 700;

  //Center the window
  hcenter = screen.width * .50;
  vcenter = screen.height * .50;
  hoffset = width * .50;
  voffset = height * .50;

  let left = hcenter - hoffset;
  let top = vcenter - voffset;

  let windowSize = {
    height,
    width,
    left,
    top
  };
  
  let url = _browser.extension.getURL("/" + pageName + "/" + pageName + ".html");
  if (params)
    url = url + "?" + params;

  console.log("Opening Passport window: " + JSON.stringify({ url, windowSize }));

  if (typeof popupWindowId === 'number') {
    console.log("Passport window already open, focusing");
    _browser.runtime.sendMessage({ target: "popup", action: "focus", url });
  }
  
  if (popupWindowId === false) {
    popupWindowId = true; //Prevent user pressing pressing the button multiple times.
    _browser.browserAction.setTitle({ title: windowIsOpenTitle });
    _browser.windows.create(
      {
        url,
        type: 'popup',
        width: windowSize.width,
        height: windowSize.height,
        left: windowSize.left,
        top: windowSize.top
      },
      function (win) {
        popupWindowId = win.id;
      }
    );
  }

  return;
}

//Look for closing popups
_browser.windows.onRemoved.addListener(function (winId) {
  if (popupWindowId === winId) {
    _browser.browserAction.setTitle({ title: windowNotOpenTitle });
    popupWindowId = false;
  }
});

_browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.target != 'background')
    return;

  if (request.action == "login") {
    console.log("login request received");
    if(popupWindowId === false){
      openPopup("main", "sender=" + sender.tab.id + "&login_request=" + request.detail.loginRequest);
    }
    else{
      _browser.runtime.sendMessage({ target: "popup", action: "focus" });
      _browser.runtime.sendMessage({ target: "popup", action: "login", sender: sender.tab.id, loginRequest: request.detail.loginRequest });
    }
    
    return;
  }

  if (request.action == "payment") {
    console.log("paymentrequest received");
    if(popupWindowId === false){
      openPopup("main", "sender=" + sender.tab.id + "&payment_request=" + request.detail.paymentRequest);
    }
    else{
      _browser.runtime.sendMessage({ target: "popup", action: "focus" });
      _browser.runtime.sendMessage({ target: "popup", action: "payment", sender: sender.tab.id, paymentRequest: request.detail.paymentRequest });
    }

    return;
  }

  if(request.action == "claimsImport"){
    console.log("claims import request received");
    _browser.runtime.sendMessage({target:"popup", action:"claimsImport", sender: sender.tab.id, claimsImportRequest: request.detail.claimsImportRequest});
  }

  if (request.action == "openPopup") {
    openPopup(request.pageName, request.params);
    return;
  }

  if (request.action == "loadPassphrase") {
    sendResponse(_passphrase);
  }

  if (request.action == "savePassphrase") {
    _passphrase = request.passphrase;
    sendResponse();
  }

  if (request.action == "removePassphrase") {
    _passphrase = null;
    sendResponse();
  }
});


