<template>
    <v-dialog v-model="visible" persistent overlay-opacity=".8">
        <v-card v-if="loading" class="py-12">
            <v-container class="text-center">
                <v-row><v-col cols="12" class="text-center"><v-img :src="'/images/spinner.svg'" height="80" contain></v-img></v-col></v-row>
                <v-row><v-col cols="12" class="text-center"><div class="text-uppercase">{{loadingMessage}}</div></v-col></v-row>
            </v-container>
        </v-card>
        <v-card class="mx-0 px-0" v-if="!loading">
            <v-toolbar
                color="gradient"
                dark
                >
                <v-toolbar-title class="subtitle-1">Publish Passport to Blockchain</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                    <p class="mt-4 mb-0">
                        Choose the blockchain to publish the passport to
                    </p>
                    <v-row>
                        <v-col class="d-flex" cols="12">
                            <v-select
                            :items="networks"
                            outlined
                            item-text="name"
                            item-value="id"
                            color="secondary"
                            :label="networkName"
                            @change="networkSelected"
                            class="mb-0"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <div v-if="network != null && !loading" class="mt-n10">
                        <v-row>
                            <v-col cols="3">
                                GAS Cost
                            </v-col>
                            <v-col cols="auto"><v-img :src="'/images/' + network + '-logo.png'" width="20" contain></v-img></v-col>
                            <v-col cols="8" class="ml-n5">
                                {{totalGasCost}} {{gasLabel}} ({{gasBalance}} Available)
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
                <v-btn color="accent" @click="publish()" v-if="!insufficientBalance">Publish to Blockchain</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'passport-blockchain-publish-dialog',
    data: function () {
        return {
            visible: true,
            loading: false,
            loadingMessage: "Please wait",
            networks: [],
            network: null,
            networkName: null,
            passportContext: null,
            hashOnly: false,
            wallet: null,
            statusMessage: null,
            gasLabel: null,
            totalGasCost: 0,
            gasBalance: 0,
            networkFee: 0,
            brdgBalance: 0,
            insufficientBalance: false,
            insufficientBalanceErrorMessage: "",
            passportPublished: false
        }
    },
    methods:{
        networkSelected: async function(network){
            this.loading = true;
            this.network = network;
            this.networkName = BridgeExtension.getNetworkName(network);

            this.wallet = this.passportContext.passport.getWalletForNetwork(network);
            await this.wallet.unlock(this.passportContext.passphrase);
            this.gasLabel = BridgeExtension.getGasName(network);

            let passportPublishCost = await BridgeProtocol.Services.Blockchain.sendPassportPublishRequest(this.passportContext.passport, this.passportContext.passphrase, this.wallet, true);
            this.totalGasCost = parseFloat(passportPublishCost);

            let balances = await BridgeExtension.getWalletBalances(this.wallet);
            this.gasBalance = balances.gas;
            this.brdgBalance = balances.brdg;

            if(this.gasBalance < this.totalGasCost){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "Insufficient " + this.gasLabel + " balance for transaction";
            }

            this.loading = false;
        },
        publish: async function(){
            this.loading = true;
            try
            {
                this.loadingMessage = "Publishing passport";
                this.wallet = this.passportContext.passport.getWalletForNetwork(this.network);
                if(!this.wallet)
                {
                    alert("No " + this.network.toUpperCase() + " wallet found.  Please add a wallet and funds.");
                    this.$emit('close', true);
                    return;
                }

                this.loadingMessage = "Sending passport publish transaction";
                console.log("Sending passport publish transaction");

                let passportPublish = await BridgeProtocol.Services.Blockchain.sendPassportPublishRequest(this.passportContext.passport, this.passportContext.passphrase, this.wallet);

                this.loading = false;
                this.$emit('published', true);
             }
            catch(err){
                alert("Unable to publish passport: " + err.message);
                console.log(err);
                this.$emit('cancel', true);
                this.loading = false;
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

        //Setup the available networks
        let ethWallet = this.passportContext.passport.getWalletForNetwork("eth");
        let neoWallet = this.passportContext.passport.getWalletForNetwork("neo");
        let bscWallet = this.passportContext.passport.getWalletForNetwork("bsc");
        if(neoWallet)
            this.networks.push({ id:"neo", name:"Neo" });
        if(ethWallet)
            this.networks.push({ id:"eth", name:"Ethereum" });
        if(bscWallet)
            this.networks.push({ id:"bsc", name:"Binance Smart Chain"});
        await this.networkSelected("neo");

        this.loading = false;
    }
};
</script>