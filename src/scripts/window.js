    //Set window
    const jquery = require('jquery');
    const Bridge = require('@bridge-protocol/bridge-protocol-js');
    const chromeAsync = require('chrome-extension-async'); 
    
    class BridgeExtension
    {
        get testPassportContent(){
            return testPassport;
        }

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

        //Passport context management
        async getPassportContext(){
            let passphrase = await this.loadPassphrase();
            console.log("passphrase retrieved: "+ passphrase);

            let passportContent = await this.loadPassportFromBrowserStorage();
            console.log("passport content: "+ passportContent);

            let passport;

            if(passportContent != null)
                passport = new BridgeProtocol.Models.Passport();
            if(passportContent != null && passphrase != null){
                await passport.open(passportContent, passphrase);
            }
                
            return { passport, passphrase };
        }

        async savePassportToBrowserStorage(passport) {
            return await browser.storage.local.set({ 'passport': passport });
        }
          
        async loadPassportFromBrowserStorage() {
            var res = await browser.storage.local.get('passport');
            if (res && res.passport)
              return JSON.stringify(res.passport);
          
            return null;
        }
          
        async removePassportFromBrowserStorage() {
            return await browser.storage.local.remove('passport');
        }
        
        async savePassphrase(passphrase) {
            return await browser.runtime.sendMessage({ target: 'background', action: 'savePassphrase', passphrase });
        }
        
        async loadPassphrase() {
            return await browser.runtime.sendMessage({ target: 'background', action: 'loadPassphrase' });
        }
        
        async removePassphrase() {
            return await browser.runtime.sendMessage({ target: 'background', action: 'removePassphrase' });
        }
        
        async closePassport() {
            await this.removePassphrase();
        }
          
        async removePassport() {
            await this.removePassphrase();
            await this.removePassportFromBrowserStorage();
        }
        
        exportPassport(passport, filename) {
            if(!filename)
                filename = "passport";
                
            var iframe = Object.assign(document.createElement('iframe'), {
                onload() {
                    var doc = this.contentDocument;
                    var a = Object.assign(doc.createElement('a'), {
                        href: 'data:text/plain;base64,' + btoa(JSON.stringify(passport)),
                        download: filename + '.json',
                    });
                    doc.body.appendChild(a);
                    a.dispatchEvent(new MouseEvent('click'));
                    setTimeout(() => this.remove());
                },
                style: 'display: none',
            });
            document.body.appendChild(iframe);
        }
    }

    //Setup the window
    window.browser = window.msBrowser || window.browser || window.chrome;
    window.$ = jquery;
    window.jQuery = jquery;
    window.BridgeProtocol = Bridge;
    window.BridgeExtension = new BridgeExtension();
