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
            <v-card-text v-if="pendingClaim != null">
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
                <v-alert
                    outlined
                    color="primary"
                    type="error"
                    class="mt-n4 caption text-justify"
                    >
                    Publish Request Already Pending
                </v-alert>
                <v-row>
                    <v-col cols="3">
                        Network
                    </v-col>
                    <v-col cols="auto">
                        {{pendingClaim.network}}
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="3">
                        Claim Type
                    </v-col>
                    <v-col cols="auto">
                        {{pendingClaim.claimTypeId}}
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text v-if="!pendingClaim">
                    <p class="mt-4 mb-0">
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
                            :label="networkName"
                            @change="networkSelected"
                            class="mb-0"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <div v-if="network != null && claimInfo != null" class="mt-n10">
                        <v-row>
                            <v-col cols="3">
                                Claim Type
                            </v-col>
                            <v-col cols="auto">
                                {{claimInfo.claimTypeName}}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                Claim Date
                            </v-col>
                            <v-col cols="auto">
                                {{claimInfo.verifiedOn}}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                Claim Value
                            </v-col>
                            <v-col cols="9" class="text-break text-left">
                                {{claimInfo.claimValue}}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                Claim Hash
                            </v-col>
                            <v-col cols="9" class="text-break text-left">
                                {{claimInfo.valueHash}}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                
                            </v-col>
                            <v-col cols="auto" class="mt-n4">
                                <input type="checkbox" v-model="hashOnly"></input> Publish hash only
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                Network Fee
                            </v-col>
                            <v-col cols="auto"><v-img :src="'/images/bridge-token.png'" width="20" contain></v-img></v-col>
                            <v-col cols="8" class="ml-n5">
                                {{networkFee}} BRDG ({{brdgBalance}} Available)
                            </v-col>
                        </v-row>
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
                         <v-alert
                            outlined
                            color="primary"
                            type="error"
                            class="mt-2 caption text-justify"
                            v-if="!passportPublished"
                            >
                            <div>Passport is not published to the blockchain.  Passport must be published to the blockchain prior to publishing a claim.</div>
                            <v-btn x-small class="accent" @click="publishPassport()">Publish Passport</v-btn>
                        </v-alert>
                    </div>
            </v-card-text>
            <v-card-actions v-if="!pendingClaim">
                <v-spacer></v-spacer>
                <v-btn text @click="cancel()">Cancel</v-btn>
                <v-btn color="accent" @click="publish()" v-if="!insufficientBalance && passportPublished">Publish to Blockchain</v-btn>
            </v-card-actions>
            <v-card-actions v-if="pendingClaim">
                <v-spacer></v-spacer>
                <v-btn text @click="cancel()">Close</v-btn>
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
            loading: true,
            loadingMessage: "Please wait",
            networks: [],
            network: null,
            networkName: null,
            passportContext: null,
            pendingClaim: null,
            claimInfo: null,
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
            this.networkName = network === "eth" ? "Ethereum" : "Neo";
            this.passportPublished = false;
            this.gasBalance = 0;
            this.brdgBalance = 0;
            this.totalGasCost = 0;
            this.insufficientBalance = false;
            this.insufficientBalanceErrorMessage = null;
            this.pendingClaim = null;

            this.wallet = this.passportContext.passport.getWalletForNetwork(network);

            //Find out if there is a pending claim publish for this type
            let pendingClaims = await BridgeProtocol.Services.Claim.getPendingClaimPublishList(this.passportContext.passport, this.passportContext.passphrase);
            for(let i=0; i<pendingClaims.length; i++){
                if(pendingClaims[i].network.toLowerCase() === this.wallet.network.toLowerCase() && pendingClaims[i].claimTypeId == this.claimInfo.claimTypeId)
                    this.pendingClaim = pendingClaims[i];
            }
            if(this.pendingClaim != null){
                this.pendingClaim.status = BridgeExtension.getReadableString(this.pendingClaim.status);
                this.loading = false;
                console.log(this.pendingClaim);
                return;
            }
                
            let published = await BridgeProtocol.Services.Blockchain.getPassportForAddress(this.wallet.network, this.wallet.address);
            if(published != null && published.length > 0)
                this.passportPublished = true;
 
            let balances = await BridgeExtension.getWalletBalances(this.wallet);
            this.gasBalance = balances.gas;
            this.brdgBalance = balances.brdg;
            this.gasLabel = network === "eth" ? "ETH" : "GAS";

            if(this.brdgBalance < this.networkFee){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "Insufficient BRDG balance for transaction";
            }

            let claimPublishGasCost = await BridgeProtocol.Services.Blockchain.sendClaimPublishRequest(this.passportContext.passport, this.passportContext.passphrase, this.wallet, this.claim, false, true);
            this.totalGasCost = parseFloat(claimPublishGasCost);
            if(this.gasBalance < this.totalGasCost){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "Insufficient GAS balance for transaction";
            }

            this.loading = false;
        },
        publish: async function(){
            this.loading = true;
            let claimPublishId;
            try
            {
                this.loadingMessage = "Sending claim publishing request";
                this.wallet = this.passportContext.passport.getWalletForNetwork(this.network);
                if(!this.wallet)
                {
                    alert("No " + this.network.toUpperCase() + " wallet found.  Please add a wallet and funds.");
                    this.$emit('close', true);
                    return;
                }
                await this.wallet.unlock(this.passportContext.passphrase);

                console.log("Sending claim publishing request");
                console.log("claim: " + this.hashOnly);
                console.log(this.claim);
                console.log("hash only: " + this.hashOnly);

                await BridgeProtocol.Services.Blockchain.sendClaimPublishRequest(this.passportContext.passport, this.passportContext.passphrase, this.wallet, this.claim, this.hashOnly);
                this.$emit('published', true);
                this.loading = false;
             }
            catch(err){
                alert("Unable to publish claim: " + err.message);
                console.log(err);
                this.$emit('cancel', true);
                this.loading = false;
            }
        },
        publishPassport: function(){
            this.$emit('publishPassport', true);
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
        this.networkFee = await BridgeProtocol.Services.Bridge.getBridgeNetworkFee(this.passportContext.passport, this.passportContext.passphrase);
        this.claimInfo = await BridgeExtension.getFullClaimInfo(this.claim);

        //Setup the available networks
        let ethWallet = this.passportContext.passport.getWalletForNetwork("eth");
        let neoWallet = this.passportContext.passport.getWalletForNetwork("neo");
        if(neoWallet)
            this.networks.push({ id:"neo", name:"Neo" });
        if(ethWallet)
            this.networks.push({ id:"eth", name:"Ethereum" });
            
        this.networkSelected("neo");
    }
};
</script>