<template>
    <v-overlay v-model="visible" persistent overlay-opacity=".8">
        <v-container elevation="0" v-if="loading" text-center align-middle>
            <v-row><v-col cols="12" class="text-center"><v-img :src="'/images/spinner.svg'" height="80" contain></v-img></v-col></v-row>
            <v-row><v-col cols="12" class="text-center"><div>{{loadStatus}}</div></v-col></v-row>
        </v-container>  
        <v-card fill-height v-if="!loading">
            <v-toolbar
                color="gradient"
                dark
                >
                <v-toolbar-title class="subtitle-1">New Bridge Marketplace Request</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                    <p class="mt-4">
                        Choose a marketplace partner to send a request to verify your personal information and add claims to your digital identity.
                    </p>
                    <v-row>
                        <v-col class="d-flex" cols="12">
                            <v-select
                            :items="partners"
                            outlined
                            item-text="name"
                            item-value="id"
                            color="secondary"
                            :label="selectedPartnerName"
                            @change="partnerSelected"
                            class="mb-0"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <div v-if="selectedPartner != null" class="mt-n10">
                        <v-row >
                            <v-col cols="3">
                                Name
                            </v-col>
                            <v-col cols="auto">
                                {{selectedPartner.name}}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                Info Link
                            </v-col>
                            <v-col cols="auto">
                                <a @click="openUrl(selectedPartner.infoUrl)">{{selectedPartner.infoUrl}}</a>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                Payment Network
                            </v-col>
                            <v-col
                                @click="networkSelected('neo')"
                                v-if="networks.includes('neo')"
                                cols="2"
                                class="my-0"
                            >
                                <v-row>
                                    <v-col cols="1" class="py-0">
                                        <v-icon left v-if="network != 'neo'">mdi-checkbox-blank-circle</v-icon>
                                        <v-icon left v-if="network == 'neo'"  color="accent">mdi-checkbox-marked-circle</v-icon>
                                    </v-col>
                                    <v-col cols="auto" class="ml-2 py-0">
                                        <v-img src="/images/neo-logo.png" width="20" contain>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col
                                @click="networkSelected('eth')"
                                v-if="networks.includes('eth')"
                                cols="2"
                                class="pl-n12 my-0"
                            >
                                <v-row>
                                    <v-col cols="1" class="py-0">
                                        <v-icon left v-if="network != 'eth'">mdi-checkbox-blank-circle</v-icon>
                                        <v-icon left v-if="network == 'eth'" color="accent">mdi-checkbox-marked-circle</v-icon>
                                    </v-col>
                                    <v-col cols="auto" class="ml-2 py-0">
                                        <v-img src="/images/eth-logo.png" width="20" contain>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col
                                @click="networkSelected('bsc')"
                                v-if="networks.includes('bsc')"
                                cols="2"
                                class="pl-n12 my-0"
                            >
                                <v-row>
                                    <v-col cols="1" class="py-0">
                                        <v-icon left v-if="network != 'bsc'">mdi-checkbox-blank-circle</v-icon>
                                        <v-icon left v-if="network == 'bsc'" color="accent">mdi-checkbox-marked-circle</v-icon>
                                    </v-col>
                                    <v-col cols="auto" class="ml-2 py-0">
                                        <v-img src="/images/bsc-logo.png" width="20" contain>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                Network Fee
                            </v-col>
                            <v-col cols="auto"><v-img src="/images/bridge-token.png" width="20" contain></v-img></v-col>
                            <v-col cols="auto" class="ml-n4">
                                {{networkFee}} BRDG ({{brdgBalance}} Available)
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                GAS Cost
                            </v-col>
                            <v-col cols="auto"><v-img :src="'/images/' + this.network.toLowerCase() + '-logo.png'" width="20" contain></v-img></v-col>
                            <v-col cols="auto" class="ml-n4">
                                {{totalGasCost}} {{gasLabel}} ({{gasBalance}} Available)
                            </v-col>
                        </v-row>
                        <v-alert
                            outlined
                            color="primary"
                            type="info"
                            class="mt-2 caption text-justify"
                            v-if="!insufficientBalance && selectedPartner != null"
                            >
                            The Bridge Network fee and any associated gas cost for the transaction is non-refundable and does not include additional fees for service that may be required by the selected Bridge Marketplace partner.  Some Bridge Marketplace partners are third party providers that have no affiliation with Bridge Protocol Corporation and may have independent terms, conditions, and fees for service.
                        </v-alert>
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
                <v-btn text @click="close()">Cancel</v-btn>
                <v-btn color="accent" @click="create()" :disabled="insufficientBalance" v-if="selectedPartner != null">Create Request</v-btn>
            </v-card-actions>
        </v-card>
    </v-overlay>
</template>

<script>
export default {
    name: 'application-create-dialog',
    data: function () {
        return {
            visible: true,
            loading: false,
            loadStatus: "Loading marketplace info...",
            passportContext: null,
            selectedPartner: null,
            selectedPartnerName: "",
            networks: [],
            network: "neo",
            wallet: null,
            networkFee: 0,
            gasLabel: "GAS",
            gasBalance: 0,
            brdgBalance: 0,
            publishGasCost: 0,
            paymentGasCost: 0,
            totalGasCost: 0,
            partners: []
        }
    },
    methods:{
        close: function(){
            this.$emit('close', true);
        },
        create: async function(){
            let app = this;
            app.loading = true;

            //Allow UI to refresh with spinner
            window.setTimeout(async function(){
                app.loadStatus = "Creating marketplace request";
                try{
                    await app.wallet.unlock(app.passportContext.passphrase);
                    await BridgeProtocol.Services.Blockchain.sendApplicationRequest(app.passportContext.passport, app.passportContext.passphrase, app.wallet, app.selectedPartner.id);
                }
                catch(err){
                    alert("Unable to create marketplace request: " + err.message);
                    app.loading = false;
                    return;
                }

                app.$emit('created', true);
                app.loading = false;
            },100);
        },
        partnerSelected: async function(partnerId){
            if(!partnerId)
                return;

            this.loading = true;
            this.loadStatus = "Loading partner information...";
            this.selectedPartner = await BridgeProtocol.Services.Partner.getPartner(partnerId);
            this.selectedPartnerName = this.selectedPartner.name;
            
            //Go with the default network
            await this.updateNetworkInfo(this.network);

            this.loading = false;
        },
        networkSelected: async function(network){
            await this.updateNetworkInfo(network);
        },
        getCostsAndBalances: async function(network){
            let wallet = this.passportContext.passport.getWalletForNetwork(network);
            let balances = await BridgeExtension.getWalletBalances(wallet);
            this.gasLabel = BridgeExtension.getGasName(this.network);
            this.gasBalance = balances.gas;
            this.brdgBalance = balances.brdg;

            //Find the cost of creating the application
            this.totalGasCost = await BridgeProtocol.Services.Blockchain.sendApplicationRequest(this.passportContext.passport, this.passportContext.passphrase, wallet, "costonly", true);

            if(balances.gas < this.totalGasCost){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "Insufficient balance for GAS cost.  This transaction requires " + this.totalGasCost + " " + this.gasLabel;
            }
            if(balances.brdg < this.networkFee){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "Insufficient balance for network fees.  This transaction requires " + this.networkFee + " BRDG";
            }
        },
        updateNetworkInfo: async function(network, forceUpdate){
            if(this.network == network && !forceUpdate)
                return; 

            this.loading = true;
            this.loadStatus = "Loading network info...";

            this.network = network;
            this.wallet = this.passportContext.passport.getWalletForNetwork(network);
            await this.getCostsAndBalances(network);

            this.loading = false;
        },
        openUrl: function(url){
            this.$emit('openUrl', url);
        }
    },
    created: async function(){
        this.loading = true;
        this.passportContext = await BridgeExtension.getPassportContext();
        this.partners = await BridgeProtocol.Services.Partner.getAllPartners();
        this.networkFee = await BridgeProtocol.Services.Bridge.getBridgeNetworkFee(this.passportContext.passport, this.passportContext.passphrase);
    
        //Setup the available networks
        let ethWallet = this.passportContext.passport.getWalletForNetwork("eth");
        let neoWallet = this.passportContext.passport.getWalletForNetwork("neo");
        let bscWallet = this.passportContext.passport.getWalletForNetwork("bsc");
        if(ethWallet)
            this.networks.push("eth");
        if(neoWallet)
            this.networks.push("neo");
        if(bscWallet)
            this.networks.push("bsc");

        //For now just default Bridge
        await this.updateNetworkInfo(this.network, true);
        await this.partnerSelected(this.partners[0].id);

        this.loading = false;
    }
};
</script>