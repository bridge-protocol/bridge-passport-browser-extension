chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let res = null;

  if (request.action == 'sendBridgeLoginResponse') {
    var event = new CustomEvent("bridge-protocol-login-response", {
      detail: {
        responseValue: request.responseValue
      }
    });
    document.dispatchEvent(event);
  }

  if (request.action == 'sendBridgePaymentResponse') {
    var event = new CustomEvent("bridge-protocol-payment-response", {
      detail: {
        transactionId: request.transactionId
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
  if (!data.detail.paymentIdentifier) {
    alert("paymentIdentifier was not provided");
    return;
  }
  if (!data.detail.paymentAmount) {
    alert("paymentAmount was not provided");
    return;
  }
  if (!data.detail.paymentAddress) {
    alert("paymentAddress was not provided");
    return;
  }

  console.log('Bridge Protocol Content Script: Payment request received: ' + JSON.stringify(data.detail));
  chrome.runtime.sendMessage({ target: "background", action: "payment", detail: data.detail });
});

