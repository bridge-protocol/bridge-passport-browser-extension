//Browser message handling
_browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.target != "popup")
		return;

	if (request.action === "focus") {
		window.focus();
		if (request.url)
			window.location.href = request.url;
	}

	sendResponse();
});

async function sendMessageToTab(tabId, message, focus) {
	_browser.tabs.update(parseInt(tabId), { 'active': true, 'highlighted': true }, async function (tab) {
		if(focus){
			let tabInfo = await _browser.tabs.get(parseInt(tabId));
			await _browser.windows.update(tabInfo.windowId, { "focused":true });
		}
		await _browser.tabs.sendMessage(tab.id, message);
	});
}

//Page navigation
async function loadPage(pageName, params, popup) {
	if (popup) {
		await _browser.runtime.sendMessage({ target: 'background', action: 'openPopup', params, pageName });
	}
	else {
		let url = "./" + pageName + ".html";
		if (params)
			url = url + "?" + params;

		location.href = url;
	}
}

function getParamAction(queryString) {
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

	let params = getParamsFromQueryString(queryString);
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

function getQueryStringFromLocation() {
	var target = String(window.location);
	var idx = target.lastIndexOf("?");
	if (idx == -1)
		return null;

	let params = target.substring(idx + 1, target.length);
	console.log("param: " + params);
	return params;
}

function getParamsFromQueryString(qs) {
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

//UI Management
document.title = 'Bridge Passport';
function hideAllModals(){
	$("#key_modal").modal("hide");
	$("#transactions_modal").modal("hide");
	$("#claims_import_modal").modal("hide");
	$("#payment_modal").modal("hide");
	$("#partner_select_modal").modal("hide");
	$("#login_modal").modal("hide");
	$("#application_details_modal").modal("hide");
}

function showWait(message, twoLine) {
	if (twoLine) {
		$("#loading_spinner").find("img").css("margin-top", "-82px");
		$("#loading_spinner_message").css("padding-top", "0px");
	}
	else {
		$("#loading_spinner").find("img").css("margin-top", "-80px");
		$("#loading_spinner_message").css("padding-top", "0px");
	}

	$("#loading_spinner_message").html(message);
	$("#loading_spinner").show();
}

function showRefreshSectionProgress(icon) {
	$(icon).addClass("refresh");
	$(icon).addClass("refresh-animation");
}

function hideRefreshSectionProgress(icon) {
	$(icon).removeClass("refresh");
	$(icon).removeClass("refresh-animation");
}

function hideWait() {
	window.setTimeout(hideSpinner, 200);
}

function hideSpinner() {
	$("#loading_spinner_message").text("");
	$("#loading_spinner").hide();
}

//Helper functions
function getDecimalForExponential(num) {
	var num = Math.pow(2, 100);
	var reconstruct = [];
	while (num > 0) {
		reconstruct.unshift(num % 10);
		num = Math.floor(num / 10);
	}
}

function makeStringReadable(str) {
	let camelMatch = /([A-Z])/g;
	str = str.replace(camelMatch, " $1");

	//Make sure we're upper case
	str = str.charAt(0).toUpperCase() + str.slice(1);

	return str;
}

//Settings management
async function saveSettingsToBrowserStorage(settings) {
	return await _browser.storage.local.set({ 'settings': settings });
}

async function loadSettingsFromBrowserStorage() {
	let settings = null;
	let res = await _browser.storage.local.get('settings');
	if(res && res.settings)
		settings = res.settings;
	else{
		settings = {
			apiBaseUrl: BridgeProtocol.Constants.bridgeApiUrl,
			explorerBaseUrl: BridgeProtocol.Constants.bridgeExplorerUrl
		}
	}
	return settings;
}

async function removeSettingsFromBrowserStorage() {
	return await _browser.storage.local.remove('settings');
}

//Passport context management
async function getPassportContext(){
	let passphrase = await loadPassphrase();
	let passportContent = await loadPassportFromBrowserStorage();
	let passport;

	if(passportContent != null)
		passport = new BridgeProtocol.Models.Passport();
	if(passportContent != null && passphrase != null){
		await passport.open(passportContent, passphrase);
	}
		
	return { passport, passphrase };
}

async function savePassportToBrowserStorage(passport) {
	return await _browser.storage.local.set({ 'passport': passport });
}
  
async function loadPassportFromBrowserStorage() {
	var res = await _browser.storage.local.get('passport');
	if (res && res.passport)
	  return JSON.stringify(res.passport);
  
	return null;
}
  
async function removePassportFromBrowserStorage() {
	return await _browser.storage.local.remove('passport');
}

async function savePassphrase(passphrase) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'savePassphrase', passphrase });
}

async function loadPassphrase() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'loadPassphrase' });
}

async function removePassphrase() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'removePassphrase' });
}

async function closePassport() {
	await removePassphrase();
}
  
async function removePassport() {
	await removePassphrase();
	await removePassportFromBrowserStorage();
}

function exportPassport(passport) {
	var iframe = Object.assign(document.createElement('iframe'), {
		onload() {
			var doc = this.contentDocument;
			var a = Object.assign(doc.createElement('a'), {
				href: 'data:text/plain;base64,' + btoa(JSON.stringify(passport)),
				download: 'passport.json',
			});
			doc.body.appendChild(a);
			a.dispatchEvent(new MouseEvent('click'));
			setTimeout(() => this.remove());
		},
		style: 'display: none',
	});
	document.body.appendChild(iframe);
}

//Blockchain addresses
async function getBalances(wallet){
	let balances = await BridgeProtocol.Services.Blockchain.getBalances(wallet.network, wallet.address);
    let brdgBalance = 0;
    let gasBalance = 0;
    for(let i=0; i<balances.length; i++){
        if(balances[i].asset.toLowerCase() === "eth" || balances[i].asset.toLowerCase() === "gas")
            gasBalance = balances[i].balance;
        else if(balances[i].asset.toLowerCase() === "brdg")
            brdgBalance = balances[i].balance;
	}
	
	return { gasBalance, brdgBalance };
}

//Claim and Application Info
async function getClaimPackageInfo(passport, password, claimPackage){
	claimPackage = new BridgeProtocol.Models.ClaimPackage(claimPackage.typeId, claimPackage.signedBy, claimPackage.claim);
	let claim = await claimPackage.decrypt(passport.privateKey, password);
	return getClaimInfo(claim);
}

async function getClaimInfo(claim){
	let claimType = await getClaimTypeInfo(claim.claimTypeId);
	let partner = await getPartnerInfoFromPublicKey(claim.signedByKey);

	claim.claimTypeName = claim.claimTypeId;
	if(claimType)
		claim.claimTypeName = claimType.name;
	claim.partnerIcon = partner.icon;
	claim.partnerColor = partner.color;
	claim.partnerId = partner.id;
	claim.partnerName = partner.name;
	claim.unknownPartner = partner.unknownPartner;

	return claim;
}

async function getPartnerInfoFromPublicKey(publicKey){
	var partnerId = await BridgeProtocol.Utils.Crypto.getPassportIdForPublicKey(publicKey);
	return await getPartnerInfo(partnerId);
}

async function getPartnerInfo(partnerId){
	let partner = {
		id: partnerId,
		name: partnerId,
		icon: "claim-icon-white.png",
		color: "grey",
		unknownPartner: true
	};
	
	let partnerInfo = await BridgeProtocol.Services.Partner.getPartner(partnerId);
	
	if(partnerInfo){
		partner = partnerInfo;

		//TODO: This will get extended for new partners
		if(partner.id === BridgeProtocol.Constants.bridgePassportId){
			partner.icon = "bridge-token-white.png";
			partner.color = "purple";
		}
	}

	return partner;
}

async function getClaimTypeInfo(claimTypeId){
	let claimType = {
		id: claimTypeId,
		name: claimTypeId
	};

	let claimTypeInfo =  await BridgeProtocol.Services.Claim.getType(claimTypeId);
	if(claimTypeInfo)
		claimType = claimTypeInfo;

	return claimType;
}

//Messaging
async function getPassportLoginRequest(passport, password, payload) {
	var request = await BridgeProtocol.Messaging.Auth.verifyPassportChallengeRequest(payload);
  
	let claimTypes = new Array();
	if (request.payload.claimTypes) {
	  for (let i = 0; i < request.payload.claimTypes.length; i++) {
		let claimTypeId = request.payload.claimTypes[i];
		let claimType = await getClaimTypeById(claimTypeId);
		if (claimType) {
		  claimTypes.push(claimType);
		}
		else{
		  claimTypes.push({ id: claimTypeId, name: claimTypeId });
		}
	  }
	}

	request.networks = request.payload.networks;
	request.claimTypes = claimTypes; //The claim types being requested
	//request.missingClaimTypes = getMissingPassportClaimTypes(claimTypes);
	request.passportDetails = await BridgeProtocol.Services.Passport.getDetails(passport, password, request.passportId);
  
	return request;
  }
  
  async function getPassportLoginResponse(request, passport, password, claimTypeIds, networks) {
	let claims = await passport.getDecryptedClaims(claimTypeIds, password);
	let addresses = passport.getWalletAddresses(networks);

	return {
	  payload: await BridgeProtocol.Messaging.Auth.createPassportChallengeResponse(passport, password, request.publicKey, request.payload.token, claims, addresses),
	  passportId: passport.id
	};
  }
  
