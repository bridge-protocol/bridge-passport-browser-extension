<template>
    <v-overlay :opacity="1">
        <v-dialog v-model="visible" persistent max-width="600px">
            <v-tabs
                v-model="tab"
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
                        <v-card-title>
                            <span class="headline">Create New Passport</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12">
                                    <v-text-field v-model="password" label="Password" type="password" required></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12">
                                    <v-text-field v-model="verifyPassword" label="Verify Password" type="password" required></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12">
                                    <v-text-field v-model="ethPrivateKey" label="Ethereum Private Key" type="text"></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12">
                                    <v-text-field v-model="neoPrivateKey" label="NEO Private Key" type="text"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn text @click="createPassport();">Create Passport</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card>
                        <v-card-title>
                            Import Passport
                        </v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12">
                                    <v-file-input v-model="importFile" accept=".json" label="Passport File"></v-file-input>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                <v-text-field v-model="importPassword" label="Password" type="password" required></v-text-field>
                                <div>{{ importErrorMessage }}</p>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn text @click="importPassport();">Import Passport</v-btn>
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
            importFile: "",
            importPassword: "",
            importErrorMessage: "",
            neoPrivateKey: "",
            ethPrivateKey: "",
            password: "",
            verifyPassword: ""
        }
    },
    methods:{
        importPassport: async function(){
            let passportContent = await this.importFile.text();
            let passport = new BridgeProtocol.Models.Passport();
            let success = false;
            
            try{
                success = await passport.open(passportContent, this.importPassword);
            }
            catch(err){
                console.log(err.message);
            }

            if(success){
                await BridgeExtension.savePassportToBrowserStorage(passport);
                await BridgeExtension.savePassphrase(this.importPassword);
                this.$emit('unlocked', true);
            }
            else{
                this.importErrorMessage = "Invalid password, try again.";
            }
        },
        createPassport: async function(){
            //TODO: Extend field validators and improve error messaging
            if(!this.password){
                alert("You must specify a password");
            }
            if(this.password != this.verifyPassword)
            {
                alert("Passwords do not match");
                return;
            }

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
                await passport.addWallet("eth", this.password, this.ethPrivateKey);
            }
            catch(err){
                console.log("Unable to add Ethererum wallet: " + err.message);
            }

            await BridgeExtension.savePassportToBrowserStorage(passport);
            await BridgeExtension.savePassphrase(this.password);

            this.$emit('unlocked', true);
        }
    }
};
</script>