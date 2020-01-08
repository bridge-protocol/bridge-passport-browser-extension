//Message handling
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

//UI
document.title = 'Bridge Passport';

function getDecimalForExponential(num) {
	var num = Math.pow(2, 100);
	var reconstruct = [];
	while (num > 0) {
		reconstruct.unshift(num % 10);
		num = Math.floor(num / 10);
	}
}

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

function makeStringReadable(str) {
	let camelMatch = /([A-Z])/g;
	str = str.replace(camelMatch, " $1");

	//Make sure we're upper case
	str = str.charAt(0).toUpperCase() + str.slice(1);

	return str;
}

//Utility
async function sendMessageToTab(tabId, message, focus) {
	_browser.tabs.update(parseInt(tabId), { 'active': true, 'highlighted': true }, async function (tab) {
		if(focus){
			let tabInfo = await _browser.tabs.get(parseInt(tabId));
			await _browser.windows.update(tabInfo.windowId, { "focused":true });
		}
		await _browser.tabs.sendMessage(tab.id, message);
	});
}

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

async function checkBridgeOnline() {
	var bridgePassportId = await getBridgePassportId();

	if (bridgePassportId) {
		return true;
	}

	return false;
}

async function checkApplicationPaymentStatus(applicationId, callback) {
	setTimeout(async function () {
		let application = await getApplication(applicationId);
		if (application.status == "waitingForPayment") {
			checkApplicationPaymentStatus(applicationId, callback);
		}
		else {
			callback(application);
		}
	}, 15000);
}


function checkMissingLoginClaimType(missingClaimTypes, claimTypeId) {
	for (let i = 0; i < missingClaimTypes.length; i++) {
		if (missingClaimTypes[i].id == claimTypeId) {
			return true;
		}
	}
	return false;
}

async function getClaimsObjects(claims) {
	if (!claims || claims.length == 0)
		return claims;

	let passportHelper = new BridgeProtocol.Passport(_settings.apiBaseUrl, _passport, _passphrase);
	let claimHelper = new BridgeProtocol.Claim(_settings.apiBaseUrl, _passport, _passphrase);
	let partnerHelper = new BridgeProtocol.Partner(_settings.apiBaseUrl, _passport, _passphrase);
	for (let i = 0; i < claims.length; i++) {
		claims[i].claimTypeName = claims[i].claimTypeId;
		var type = await claimHelper.getClaimType(claims[i].claimTypeId);
		if (type) {
			claims[i].claimTypeName = type.name;
		}

		var partnerId = await passportHelper.getPassportIdForPublicKey(claims[i].signedByKey);
		if (partnerId) {
			claims[i].signedById = partnerId;
			var partner = await partnerHelper.getPartner(partnerId);
			if (partner) {
				claims[i].signedByName = partner.name;
			}
		}
	}

	return claims;
}

async function getPartnerInfo(partnerId){
	let partnerHelper = new BridgeProtocol.Partner(_settings.apiBaseUrl, _passport, _passphrase);
	let partner = await partnerHelper.getPartner(partnerId);

	//Default to unknown network partner
	if(!partner){
		return {
			unknownPartner: true,
            id: partnerId,
            name: "Unknown Verifier",
            publicKey: "2d2d2d2d2d424547494e20504750205055424c4943204b455920424c4f434b2d2d2d2d2d0a56657273696f6e3a204b657962617365204f70656e5047502076322e302e38320a436f6d6d656e743a2068747470733a2f2f6b6579626173652e696f2f63727970746f0a0a786d384558482b734e684d464b34454541434944417753523271707949585168386a6f6f7936794c52624b546942585345467a537a2f4d615976516e395649360a795a4a7634584e38525139744d733957593771665474694e4f324e41437635324b634b4c46752f2b456a486a4d6f4c78596671334739693762495565654d55740a7a62734245675944553031646f31715641515a6141767a4e466e567a5a584a41596e4a705a47646c63484a766447396a6232777561572f436c67515445776f410a4867554358482b734e67496241514d4c4351634446516f494168344241686541417859434151495a4151414b435241656a4e70716939337862576a49415944690a3870594b766148594b512b2b3555654a58425653377a704f3441485943675a4f4872696e4458325037476f766669524a65416e4851597a7576587079577677420a6632684c73424666354938796b6b2b4c30332b56575269723665795135454268394c764f69796b4f6a447852766b6d53524273466b5152624f366a52706176780a384d35574246782f7244595343437147534d34394177454841674d455a7a6e394e476b4f4757757147666564753237334577565050324e6f4d6c725a2b73567a0a6b65524d6b3257785635395a6876764f622b79694e4b4d5964393370505737545a75304d33707970363176444977496e76414d4243676e436877515945776f410a4477554358482b734e67554a44776d63414149624441414b435241656a4e7071693933786261776d41583439465564637a735044367a6c304a6663384552716f0a39416d686f746b42414f7835734876696730564c5a396e46552b726947664b734d624a58316639772b645942674c49365a4c45754132425841586536382f63690a56363242324c704a354235765352436b6e6a356c2f376464596f5a4b34762b6575634a38514f54596132454c4b7335534246782f7244595443437147534d34390a4177454841674d454c6e55467059446534554d51663669697359314f585a32336f6350445937575449696165575a51667a4d37736b6a7437656e4841705136770a334768424c376468785043484a5251526877487a594c2b6e6d4f364e6d4d4c414a77515945776f414477554358482b734e67554a44776d6341414962496742710a435241656a4e7071693933786256386742426b544367414742514a636636773241416f4a45427a3278412b627a32726e61484d42414f30374b4f505242384c4a0a384f575467376a732b6b5678763152566f557a506b466655756f354257452f2f4150774a4f6e3637764f684857634870796f6f6a6f7553554b53774f655554330a64784e7272414c4b2f6f3758383557744158394462707a48346459476c372f6f76515667456f6f48585a79374f6874366f6b56576b7a506f6f5a324e4b2f356d0a42654b3473362b362b61486d467376704a4c51426750757534476a686935795a703348326e6866727a54554e786c6850744a787a2b454a744d7973455432386c0a565735426a643666766a6d6b743051625039472b61773d3d0a3d585855540a2d2d2d2d2d454e4420504750205055424c4943204b455920424c4f434b2d2d2d2d2d0a",
            verificationServices: [],
			infoUrl: "",
			color: "rgba(180,180,180,1)",
			icon: "/images/shared/unknown-logo-white.png"
        };
	}

	//Return color for known network partners
	if(partner.name == "Bridge Protocol Corporation"){
		partner.color = "rgba(97,85,163,1)";
		partner.icon = "/images/shared/bridge-token-white.png";
	}
	//TODO: Add more partners here as the network grows

	return partner;
}

//Background script messaging helpers
async function getBridgePassportId() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getBridgePassportId' });
}

async function getPassphrase() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getPassphrase' });
}

async function getPassportFromStorage() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getPassportFromStorage' });
}

async function createPassport(passphrase, neoWif, autoCreate) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'createPassport', passphrase, neoWif, autoCreate });
}

async function getPassportDetails() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getPassportDetails' });
}

async function getPassportIdForPublicKey(publicKey) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getPassportIdForPublicKey', publicKey });
}

async function importPassport(content, passphrase) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'importPassport', content, passphrase });
}

async function unlockPassport(passphrase) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'unlockPassport', passphrase });
}

async function getPassport() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getPassport' });
}

async function closePassport() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'closePassport' });
}

async function removePassport() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'removePassport' });
}

async function getPassportClaims() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getClaims' });
}

async function getApplications() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getApplications' });
}

async function getApplication(applicationId) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getApplication', applicationId });
}

async function createApplication(partner) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'createApplication', partner });
}

async function updateApplicationTransaction(applicationId, network, transactionId) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'updateApplicationTransaction', applicationId, network, transactionId });
}

async function resendApplication(applicationId) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'resendApplication', applicationId });
}

async function clearCache() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'clearCache' });
}

async function getSettings() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getSettings' });
}

async function saveSettings(settings) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'saveSettings', settings });
}

async function getVerificationPartners() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getVerificationPartners' });
}

async function getVerificationPartner(partnerId) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getVerificationPartne', partnerId });
}

async function getPassportLoginRequest(payload) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getPassportLoginRequest', payload });
}

async function getPassportLoginResponse(request, claimTypeIds) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getPassportLoginResponse', request, claimTypeIds });
}

async function removeAllApplicationClaims(applicationId) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'removeAllApplicationClaims', applicationId });
}

async function updateClaimPackages(claimPackages) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'updateClaimPackages', claimPackages });
}

async function removeClaimPackage(claimTypeId) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'removeClaimPackage', claimTypeId });
}

async function getNetworkFee() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getNetworkFee' });
}

async function getBlockchainAddresses() {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getBlockchainAddresses' });
}

async function getBlockchainPrivateKey(network, key) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getBlockchainPrivateKey', network, key });
}

async function registerBlockchainAddress(network, address) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'registerBlockchainAddress', network, address });
}

async function sendBlockchainPayment(network, amount, paymentIdentifier, recipientAddress) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'sendBlockchainPayment', network, amount, paymentIdentifier, recipientAddress });
}

async function getBlockchainPassportInfo(network, passportId) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getBlockchainPassportInfo', network, passportId });
}

async function getBlockchainAddressInfo(network, address) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getBlockchainAddressInfo', network, address });
}

async function getBlockchainTransactionInfo(network, transactionId) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'getBlockchainTransactionInfo', network, transactionId });
}

async function checkBlockchainTransactionComplete(network, transactionId) {
	return await _browser.runtime.sendMessage({ target: 'background', action: 'checkBlockchainTransactionComplete', network, transactionId });
}