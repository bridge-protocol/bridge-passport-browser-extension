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
            var manifestData = chrome.runtime.getManifest();
            return manifestData.version;
        }

        get passportVersion(){
            return BridgeProtocol.Constants.passportVersion;
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

        getParamRequest(queryString) {
            let action = {
                action: "none",
                loginRequest: null,
                paymentRequest: {
                    amount: 0,
                    account: null,
                    identifier: null
                },
                sender: null
            };
        
            let params = this.getParamsFromQueryString(queryString);
            if (!params || !Array.isArray(params) || params.length == 0)
                return { action };
        
            for (let i = 0; i < params.length; i++) {
                if (params[i].key == "sender") {
                    action.sender = params[i].val;
                }
                else if (params[i].key == "login_request") {
                    action.action = "login";
                    action.loginRequest = params[i].val;
                }
                else if (params[i].key == "payment_request") {
                    action.action = "payment";
                    action.paymentRequest = params[i].val;
                }
            }
        
            return action;
        }
        
        getQueryStringFromLocation() {
            var target = String(window.location);
            var idx = target.lastIndexOf("?");
            if (idx == -1)
                return null;
        
            let params = target.substring(idx + 1, target.length);
            console.log("param: " + params);
            return params;
        }
        
        getParamsFromQueryString(qs) {
            let params = [];
            let pairs = qs.split('&');
            for (let i = 0; i < pairs.length; i++) {
                let pair = pairs[i].split('=');
                params.push({
                    key: pair[0],
                    val: pair[1]
                });
            }
            return params;
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

        async savePassportToSyncStorage(passport){
            return await browser.storage.sync.set({ 'passport': passport });
        }
        
        async loadPassportFromSyncStorage(){
            var res = await browser.storage.sync.get('passport');
            if (res && res.passport)
              return JSON.stringify(res.passport);
          
            return null;
        }

        async removePassportFromSyncStorage() {
            return await browser.storage.sync.remove('passport');
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

        async sendLoginResponse(sender, response){
            let message = {
                action: 'sendBridgeLoginResponse',
                loginResponse: response
            };
            await this.sendMessageToTab(sender, message, true);
        }

        async sendPaymentResponse(sender, response){
            let message = {
                action: 'sendBridgePaymentResponse',
                paymentResponse: response
            };
            await this.sendMessageToTab(sender, message, true);
        }

        async sendMessageToTab(tabId, message, focus) {
            window.browser.tabs.update(parseInt(tabId), { active: true, highlighted: true }, async function (tab) {
                if(focus){
                    let tabInfo = await window.browser.tabs.get(parseInt(tabId));
                    await window.browser.windows.update(tabInfo.windowId, { "focused": true });
                }
                await window.browser.tabs.sendMessage(tab.id, message);
            });
        }

        getReadableDate(date, includeTime){
            date = new Date(date * 1000); 
            let res = date.toLocaleDateString();
            if(includeTime)
                res += " " + date.toLocaleTimeString();
            return res;
        }

        async getClaimType(claimTypeId){
            return await BridgeProtocol.Services.Claim.getType(claimTypeId);
        }

        async getClaimTypes(claimTypeIds){
            let claimTypes = [];
            for(let i=0; i<claimTypeIds.length; i++){
                let claimType = await this.getClaimType(claimTypeIds[i]);
                if(claimType)
                    claimTypes.push(claimType);
            }
            return claimTypes;
        }

        async getFullClaimsInfo(claims){
             //Update the claims information
             for(let i=0; i<claims.length; i++)
                claims[i] = await this.getFullClaimInfo(claims[i]);

             return claims;
        }

        async getFullClaimInfo(claim){
             //Assingn a unique id
             claim.id = Math.random().toString(36).substring(2) + Date.now().toString(36);
             claim.verifiedOn = this.getReadableDate(claim.createdOn);
             //Find the expiration date
             if(claim.expiresOn == 0)
                 claim.expiresOn = "Never";
             else{
                 claim.expiresOn = this.getReadableDate(claim.expiresOn);
             }
                 
             //Set the claim type name
             claim.claimTypeName = claim.claimTypeId;
             let claimType = await BridgeProtocol.Services.Claim.getType(claim.claimTypeId);
             if(claimType)
                 claim.claimTypeName = claimType.name;

             //Get the id it was signed by
             claim.signedById = await BridgeProtocol.Utils.Crypto.getPassportIdForPublicKey(claim.signedByKey);
             claim.signedByName = claim.signedById;
             let partner = await BridgeProtocol.Services.Partner.getPartner(claim.signedById);
             if(partner)
                 claim.signedByName = partner.name;

             return claim;
        }
    }

    //Setup the window
    window.browser = window.msBrowser || window.browser || window.chrome;
    window.$ = jquery;
    window.jQuery = jquery;
    window.BridgeProtocol = Bridge;
    window.BridgeExtension = new BridgeExtension();
