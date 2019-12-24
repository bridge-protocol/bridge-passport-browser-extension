chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let res = null;

  if (request.action == 'sendBridgeLoginResponse') {
    var event = new CustomEvent("bridge-protocol-login-response", {
      detail: {
        loginResponse: request.loginResponse
      }
    });
    document.dispatchEvent(event);
  }

  if (request.action == 'sendBridgePaymentResponse') {
    var event = new CustomEvent("bridge-protocol-payment-response", {
      detail: {
        paymentResponse: request.paymentResponse
      }
    });
    document.dispatchEvent(event);
  }

  sendResponse(res);
});

document.addEventListener("bridge-protocol-login-request", function (data) {
  if (!data.detail.loginRequest) {
    alert("loginRequest was not provided");
    return;
  }
  console.log('Bridge Protocol Content Script: Login request received: ' + JSON.stringify(data.detail));
  chrome.runtime.sendMessage({ target: "background", action: "login", detail: data.detail });
});

document.addEventListener("bridge-protocol-payment-request", function (data) {
  if (!data.detail.paymentRequest) {
    alert("paymentRequest was not provided");
    return;
  }

  console.log('Bridge Protocol Content Script: Payment request received: ' + JSON.stringify(data.detail));
  chrome.runtime.sendMessage({ target: "background", action: "payment", detail: data.detail });
});

document.addEventListener("bridge-protocol-claims-import-request", function (data) {
  if (!data.detail.claimsImportRequest) {
    alert("claimsImportRequest was not provided");
    return;
  }

  console.log('Bridge Protocol Content Script: Claims import request received: ' + JSON.stringify(data.detail));
  chrome.runtime.sendMessage({ target: "background", action: "claimsImport", detail: data.detail });
});

//Wait for window load and set a window variable to the current Bridge Passport Version
document.addEventListener('readystatechange', (event) => {
  if(document.readyState === 'complete'){
    try{
      var manifestData = chrome.runtime.getManifest();
      let script = document.createElement('script');
      script.text = "window.bridgePassportVersion='" + manifestData.version + "';";
      document.documentElement.appendChild(script);
    }
    catch(err){
      console.log(err);
    }
  }
});