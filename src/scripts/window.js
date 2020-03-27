    //Set window
    const jquery = require('jquery');
    const Bridge = require('@bridge-protocol/bridge-protocol-js');

    class BridgeExtension
    {
        get version(){
            return "2.5.1";
        }

        async getPassportContext(){
            return {
                passport: "123412412541251235",
                passphrase: "123"
            };
        }

        //Page navigation
        openPage(url){
            window.open(url);
        }

        loadPage(pageName, params, popup) {
            if (popup) {
                browser.runtime.sendMessage({ target: 'background', action: 'openPopup', params, pageName });
            }
            else {
            let url = "../" + pageName + "/" + pageName + ".html";
            if (params)
                url = url + "?" + params;
        
            location.href = url;
            }
        }
    }

    //Setup the window
    window.browser = window.msBrowser || window.browser || window.chrome;
    window.$ = jquery;
    window.jQuery = jquery;
    window.BridgeProtocol = Bridge;
    window.BridgeExtension = new BridgeExtension();
