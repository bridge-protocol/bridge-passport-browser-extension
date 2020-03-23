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
	let passphrase = await loadPassphraseFromBrowserStorage();
	let passport = await loadPassportFromBrowserStorage();
	return { passport, passphrase };
}

async function savePassportToBrowserStorage(passport) {
	return await _browser.storage.local.set({ 'passport': JSON.stringify(passport) });
}
  
async function loadPassportFromBrowserStorage() {
	var res = await _browser.storage.local.get('passport');
	if (res && res.passport)
	  return JSON.parse(res.passport);
  
	return null;
}
  
async function removePassportFromBrowserStorage() {
	return await _browser.storage.local.remove('passport');
}

async function savePassphraseToBrowserStorage(passphrase) {
	return await _browser.storage.local.set({ 'passphrase': passphrase });
}

async function loadPassphraseFromBrowserStorage() {
	let res = await _browser.storage.local.get('passphrase');
	return res.passphrase;
}

async function removePassphraseFromBrowserStorage() {
	return await _browser.storage.local.remove('passphrase');
}

async function closePassport() {
	await removePassphraseFromBrowserStorage();
}
  
async function removePassport() {
	await removePassphraseFromBrowserStorage();
	await removePassportFromBrowserStorage();
}

async function unlockPassport(passport, passphrase){
	let passportContent = JSON.stringify(passport);
	let unlocked = new BridgeProtocol.Models.Passport();
	return await unlocked.open(passportContent, passphrase);
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
