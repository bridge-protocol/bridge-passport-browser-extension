var _params;
var _passportContent;

$(function () {
    _params = getQueryStringFromLocation();
    
    $("#create_passport_link").click(function () {
        loadPage("createpassport", _params);
    });

    $("#import_passport_button").click(function () {
        if (!_passportContent) {
            alert("A valid passport file is required.");
            return;
        }
        var passphrase = $("#import_passphrase").val();
        if (!passphrase) {
            alert("Passphrase is required.");
            return;
        }

        showWait("Opening Bridge Passport...");
        setTimeout(async function () {
            try {
                var passport = new BridgeProtocol.Models.Passport();
                let res = await passport.open(_passportContent, passphrase);
                if (res) {
                    await savePassportToBrowserStorage(passport);
                    await savePassphrase(passphrase);
                    loadPage("main", _params);
                }
                else {
                    $("#error").text("Invalid passphrase.");
                    hideWait();
                }
            }
            catch (err) {
                alert("Could not load passport: " + err);
                hideWait();
            }
        }, 50);
    });

    $('#import_file').change(async function () {
        var reader = new FileReader();
        reader.addEventListener("loadend", async function () {
            if (reader.result) {
                _passportContent = reader.result;
                console.log("Loaded passport from file.");
            }
        });
        reader.readAsText(this.files[0]);
    });

    hideWait();
});