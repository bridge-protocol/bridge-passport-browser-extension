var _params;

$(function () {
    _params = getQueryStringFromLocation();

    $("#create_passport_link").click(function () {
        $("#create_passport_container").show();
        $("#import_passport_container").hide();
    });

    $("#import_passport_link").click(function () {
        loadPage("importpassport", _params);
    });

    $("#create_passport_button").click(async function () {
        var passphrase = $("#create_passphrase").val();
        var verifyPassphrase = $("#verify_passphrase").val();
        if (!passphrase) {
            alert("Passphrase is required.");
            return;
        }
        if(!verifyPassphrase){
            alert("Please verify your passphrase.");
            return;
        }
        if(passphrase != verifyPassphrase){
            alert("Passphrase and verification do not match.");
            return;
        }

        showWait("Creating Bridge Passport...");
        setTimeout(async function () {
            try {
                let neoPrivateKey = $("#neo_wif").val();
                let ethPrivateKey = $("#eth_key").val();

                var passport = new BridgeProtocol.Models.Passport();
                await passport.create(passphrase);
                if(neoPrivateKey)
                    await passport.addWallet("neo", passphrase, neoPrivateKey);
                if(ethPrivateKey)
                    await passport.addWallet("eth", passphrase, ethPrivateKey);

                if (passport.id) {
                    //Save to browser storage
                    await savePassportToBrowserStorage(passport);
                    await savePassphrase(passphrase);
                    loadPage("main", _params);
                }
                else {
                    alert("Could not create passport");
                }
            }
            catch (err) {
                alert("Could not create passport: " + err.message);
            }
        }, 50);
    });

    $('.ui.accordion').accordion();
    hideWait();
});

