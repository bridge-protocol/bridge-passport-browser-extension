<template>
    <v-dialog v-model="visible" persistent overlay-opacity=".8">
        <v-card v-if="loading" class="py-12">
            <v-container text-center align-middle>
                <v-progress-circular
                    indeterminate
                    color="secondary"
                ></v-progress-circular>
                <v-container>{{loadingMessage}}</v-container>
            </v-container>  
        </v-card>
        <v-card class="mx-0 px-0" v-if="!loading">
            <v-toolbar
                color="gradient"
                dark
                >
                <v-toolbar-title class="subtitle-1">Publish Claim to Blockchain</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                    <p class="mt-4">
                        Choose the blockchain and method of publishing the claim below
                    </p>
                    <v-row>
                        <v-col class="d-flex" cols="12">
                            <v-select
                            :items="networks"
                            outlined
                            item-text="name"
                            item-value="id"
                            color="secondary"
                            label="Blockchain"
                            @change="networkSelected"
                            class="mb-0"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <div v-if="network != null" class="mt-n10">
                        <v-row>
                            <v-col cols="3">
                                GAS Cost
                            </v-col>
                            <v-col cols="1"><v-img src="/images/eth-logo.png" width="20" contain></v-img></v-col>
                            <v-col cols="auto">
                                {{totalGasCost}} ETH ({{gasBalance}} Available)
                            </v-col>
                        </v-row>
                        <v-alert
                            outlined
                            color="primary"
                            type="error"
                            class="mt-2 caption text-justify"
                            v-if="insufficientBalance"
                            >
                            {{insufficientBalanceErrorMessage}}
                        </v-alert>
                    </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="cancel()">Cancel</v-btn>
                <v-btn color="secondary" @click="publish()">Publish to Blockchain</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'passport-blockchain-publish-dialog',
    props: ['claim'],
    data: function () {
        return {
            visible: true,
            loading: false,
            loadingMessage: "Please wait",
            networks: [{ id:"eth", name:"Ethereum" },{ id:"neo", name:"NEO" }],
            network: null,
            passportContext: null,
            ethWallet: null,
            neoWallet: null,
            totalGasCost: 0,
            gasBalance: 0,
            insufficientBalance: false,
            insufficientBalanceErrorMessage: "",
            passportPublished: false
        }
    },
    methods:{
        networkSelected: async function(obj){
            alert(JSON.stringify(obj));

            let published = await BridgeProtocol.Services.Blockchain.getPassportForAddress(this.wallet.network, this.wallet.address);
            this.passportPublished = published != null && published.length > 0;
        },
        publish: async function(){
            this.loading = true;
            try
            {
                this.loadingMessage = "Preparing to publish claim";
                this.wallet = this.passportContext.passport.getWalletForNetwork(this.network);
                if(!this.wallet)
                {
                    alert("No " + this.network.toUpperCase() + " wallet found.  Please add a wallet and funds.");
                    this.$emit('close', true);
                    return;
                }
                await this.wallet.unlock(this.passportContext.passphrase);

                //Make sure the passport is published / registered
                if(!this.published)
                {
                    console.log("Passport not published, publishing");
                    await BridgeProtocol.Services.Blockchain.publishPassport(this.wallet, this.passportContext.passport);
                    let published = await BridgeProtocol.Services.Blockchain.getPassportForAddress(this.wallet.network, this.wallet.address);
                    this.passportPublished = published != null && published.length > 0;
                    if(!this.passportPublished)
                    {
                        alert("Could not publish passport.");
                        return;
                    }
                }

                this.loadingMessage = "Publishing claim transaction";
                console.log("Publishing claim");
                await BridgeProtocol.Services.Blockchain.addClaim(this.passportContext.passport, this.passportContext.passphrase, this.wallet, this.claim, false);
                this.$emit('published', true);
                this.loading = false;
             }
            catch(err){
                alert("Unable to publish claim: " + err.message);
                console.log(err);
                this.$emit('cancel', true);
            }
        },
        cancel: function(){
            this.$emit('cancel', true);
        },
        openPage: function(url){
            this.$emit('openUrl', url);
        }
    },
    mounted: async function(){
        this.loading = true;
        this.passportContext = await BridgeExtension.getPassportContext();
        this.ethWallet = this.passportContext.passport.getWalletForNetwork("eth");
        this.neoWallet = this.passportContext.passport.getWalletForNetwork("neo");
        this.loading = false;
    }
};
</script>