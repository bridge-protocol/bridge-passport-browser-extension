<template>
    <v-overlay :opacity="1">
        <v-dialog v-model="visible" persistent overlay-opacity=".8">
            <v-tabs
                v-model="tab"
                background-color="gradient"
                color="white"
                class="elevation-2"
                dark
                >
                <v-tab>
                    Create New
                </v-tab>
                <v-tab>
                    Import
                </v-tab>
                <v-tab-item>
                    <v-card>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="auto"><v-img src="../images/bridge-token.png" width="36"></v-img></v-col>
                                    <v-col cols="auto" class="headline ml-0">Create a New Passport</v-col>
                                </v-row>
                            </v-container>
                            <v-container>
                                <p>
                                    Create a password to be used to encrypt your Bridge Passport and any associated blockchain wallets when exported or not in use.  This should be a complex password or passphrase only you know.  Be sure to save this password as you will be unable to access your passport without it.
                                </p>
                                <v-row dense>
                                    <v-col cols="12">
                                        <v-text-field v-model="password" :error="passwordErrorMessages != null" :errorMessages="passwordErrorMessages" color="secondary" placeholder=" " label="Password" type="password" outlined dense></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row dense>
                                    <v-col cols="12">
                                        <v-text-field v-model="verifyPassword" :error="verifyPasswordErrorMessages != null" :errorMessages="verifyPasswordErrorMessages" color="secondary" placeholder=" " label="Verify Password" type="password" outlined dense></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-expansion-panels flat class="mt-n6">
                                    <v-expansion-panel key="1" class="px-0 mx-0">
                                        <v-expansion-panel-header class="px-0 mx-0">
                                            Import Existing Blockchain Wallets
                                        </v-expansion-panel-header>
                                        <v-expansion-panel-content class="mx-n5">
                                            <v-row dense>
                                                <v-container class="text-justify caption px-0 py-0 mx-0 mt-n2 mb-4" style="color: rgba(255, 255, 255, 0.7);">
                                                    If you have existing NEO or Ethereum wallets you would like to include in your passport, provide the private keys below.  If you want to generate one or more new wallets, simply leave the field(s) blank.
                                                </v-container>
                                            </v-row>
                                            <v-row dense>
                                                <v-col cols="auto"><v-img src="../images/neo-logo.png" width="36"></v-img></v-col>
                                                <v-col cols="11">
                                                <v-text-field v-model="neoPrivateKey" color="secondary" label="NEO Private Key" placeholder=" " type="text" outlined dense></v-text-field>
                                                </v-col>
                                            </v-row>
                                            <v-row dense>
                                                <v-col cols="auto"><v-img src="../images/eth-logo.png" width="36"></v-img></v-col>
                                                <v-col cols="11">
                                                <v-text-field v-model="ethPrivateKey" color="secondary" label="Ethereum Private Key" placeholder=" " type="text" outlined dense></v-text-field>
                                                </v-col>
                                            </v-row>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="accent" @click="createPassport();" :loading="wait">Create Passport</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="auto"><v-img src="../images/bridge-token.png" width="36"></v-img></v-col>
                                    <v-col cols="auto" class="headline ml-0">Import an Existing Passport</v-col>
                                </v-row>
                            </v-container>
                            <v-container class="text-justivy caption">
                                If you have an existing Bridge Passport you would like to import, simply select the exported passport file and enter the password you created when you created the passport.
                            </v-container>
                            <v-row dense>
                                <v-col cols="12">
                                    <v-file-input v-model="importFile" :error="importFileErrorMessages != null" :errorMessages="importFileErrorMessages" color="secondary" accept=".json" label="Passport File" placeholder="Select passport file" required outlined dense prepend-icon=""></v-file-input>
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="12">
                                <v-text-field v-model="importPassword" :error="importPasswordErrorMessages != null" :errorMessages="importPasswordErrorMessages" color="secondary" label="Password" type="password" placeholder=" " required outlined dense></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="accent" @click="importPassport();" :loading="wait">Import Passport</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-tab-item>
            </v-tabs>      
        </v-dialog>
    </v-overlay>
</template>

<script>
export default {
    name: 'create-import-dialog',
    data: function () {
        return {
            visible: true,
            wait: false,
            passwordErrorMessages: null,
            verifyPasswordErrorMessages: null,
            importFileErrorMessages: null,
            importPasswordErrorMessages: null,
            neoPrivateKey: null,
            ethPrivateKey: null,
            importFile: null,
            importPassword: null,
            password: null,
            verifyPassword: null
        }
    },
    methods:{
        importPassport: async function(){
            this.importFileErrorMessages = null;
            this.importPasswordErrorMessages = null;

            if(!this.importFile){
                this.importFileErrorMessages = ["Please select a passport file"];
                return;
            }
            if(!this.importPassword){
                this.importPasswordErrorMessages = ["Password is required"];
                return;
            }
            
            this.wait = true;

            let passportContent = await this.importFile.text();
            let passport = new BridgeProtocol.Models.Passport();
            let success = false;

            try{
                success = await passport.open(passportContent, this.importPassword);
                passport.version = BridgeExtension.passportVersion;
            }
            catch(err){
                console.log(err.message);
            }

            if(success){
                await BridgeExtension.savePassportToBrowserStorage(passport);
                await BridgeExtension.savePassphrase(this.importPassword);
                this.wait = false;
                this.$emit('unlocked', true);
            }
            else{
                this.wait = false;
                this.importPasswordErrorMessages = ["Invalid password, try again."];
            }
        },
        createPassport: async function(){
            this.passwordErrorMessages = null;
            this.verifyPasswordErrorMessages = null;

            //TODO: Extend field validators and improve error messaging
            if(!this.password){
                this.passwordErrorMessages = ["Password is required"];
                return;
            }
            if(this.password != this.verifyPassword)
            {
                this.verifyPasswordErrorMessages = ["Passwords do not match"];
                return;
            }

            this.wait = true;

            let passport = new BridgeProtocol.Models.Passport();
            await passport.create(this.password);
            let success = false;
            try{
                success = passport.id != null;
            }
            catch(err){
                console.log(err.message);
            }

            try{
                await passport.addWallet("neo", this.password, this.neoPrivateKey);
            }
            catch(err){
                console.log("Unable to add NEO wallet: " + err.message);
            }

            try{
                if(this.ethPrivateKey && !this.ethPrivateKey.startsWith("0x"))
                    this.ethPrivateKey = "0x" + this.ethPrivateKey;

                await passport.addWallet("eth", this.password, this.ethPrivateKey);
            }
            catch(err){
                console.log("Unable to add Ethererum wallet: " + err.message);
            }

            await BridgeExtension.savePassportToBrowserStorage(passport);
            await BridgeExtension.savePassphrase(this.password);

            this.wait = false;
            this.$emit('unlocked', true);
        }
    }
};
</script>