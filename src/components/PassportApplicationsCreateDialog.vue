<template>
    <v-dialog v-model="visible" persistent overlay-opacity=".8">
        <v-card v-if="loading" class="py-12">
            <v-container text-center align-middle>
                <v-progress-circular
                    indeterminate
                    color="secondary"
                ></v-progress-circular>
                <v-container>{{loadStatus}}</v-container>
            </v-container>  
        </v-card>
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
                                cols="auto"
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
                                    <v-col cols="5" class="ml-n4 py-0">
                                        NEO
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col
                                @click="networkSelected('eth')"
                                v-if="networks.includes('eth')"
                                cols="4"
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
                                    <v-col cols="6" class="ml-n4 py-0">
                                        Ethereum
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
    </v-dialog>
</template>

<script>
export default {
    name: 'application-create-dialog',
    data: function () {
        return {
            visible: true,
            loading: false,
            loadStatus: "Loading marketplace info",
            passportContext: null,
            passportPublished: false,
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
            app.loadStatus = "Please wait";

            //Allow UI to refresh with spinner
            window.setTimeout(async function(){
                //Make sure the passport is published / registered
                if(!app.passportPublished)
                {
                    app.loadStatus = "Publishing passport to blockchain";
                    console.log("Passport not published, publishing");
                    
                    await BridgeProtocol.Services.Blockchain.publishPassport(app.wallet, app.passportContext.passport);
                    let publish = await BridgeProtocol.Services.Blockchain.getPassportForAddress(app.wallet.network, app.wallet.address);
                    if(!publish)
                    {
                        alert("Could not publish passport.");
                        app.loading = false;
                        return;
                    }
                }

                app.loadStatus = "Creating marketplace request";
                //Create the application via API
                let application = await BridgeProtocol.Services.Application.createApplication(app.passportContext.passport, app.passportContext.passphrase, app.selectedPartner.id);
                if(!application){
                    alert("Unable to create marketplace request.");
                    app.loading = false;
                    return;
                }

                let applicationId = application.id;
                console.log("Request created: " + applicationId);

                //Send a blockchain fee payment
                app.loadStatus = "Sending network fee transaction";
                console.log("Sending network fee for " + applicationId);

                let recipient = null;
                if(app.wallet.network.toLowerCase() === "neo")
                    recipient = BridgeProtocol.Constants.bridgeAddress;
                else if (app.wallet.network.toLowerCase() === "eth")
                    recipient = BridgeProtocol.Constants.bridgeEthereumAddress;

                //Get the transaction id and send to the server and don't wait
                let transactionId = await BridgeProtocol.Services.Blockchain.sendPayment(app.wallet, app.networkFee, recipient, applicationId, false);

                //Send the fee payment info back to the application API
                application = await BridgeProtocol.Services.Application.updatePaymentTransaction(app.passportContext.passport, app.passportContext.passphrase, applicationId, app.wallet.network, app.wallet.address, transactionId);
                console.log("Request fee transaction updated: " + JSON.stringify(application));

                app.loadStatus = "Verifying network fee transaction";
                //Wait for the transaction to be done
                let status = await BridgeExtension.waitVerifyPayment(app.wallet.network, transactionId, app.wallet.address, recipient, app.networkFee, applicationId);
                console.log("Network fee transaction: " + JSON.stringify(status));

                if(status)
                {
                    //Relay to the partner
                    app.loadStatus = "Relaying request to partner";
                    await BridgeProtocol.Services.Application.retrySend(app.passportContext.passport, app.passportContext.passphrase, application.id);
                }
                else{
                    alert("Payment verification failed");
                }

                app.$emit('created', true);
                app.loading = false;
            },100);
        },
        partnerSelected: async function(partnerId){
            if(!partnerId)
                return;

            this.loading = true;
            this.loadStatus = "Loading partner information";
            this.selectedPartner = await BridgeProtocol.Services.Partner.getPartner(partnerId);
            this.selectedPartnerName = this.selectedPartner.name;
            
            //Go with the default network
            await this.updateNetworkInfo(this.network);

            this.loading = false;
        },
        networkSelected: async function(network){
            await this.updateNetworkInfo(network);
        },
        updateNetworkInfo: async function(network){
            if(this.network == network)
                return; 

            this.loading = true;
            this.loadStatus = "Please wait";
            this.network = network;
            this.wallet = this.passportContext.passport.getWalletForNetwork(this.network);
            let published = await BridgeProtocol.Services.Blockchain.getPassportForAddress(this.wallet.network, this.wallet.address);
            this.passportPublished = published != null && published.length > 0;

            let balances = await BridgeExtension.getWalletBalances(this.wallet);
            this.gasLabel = "GAS";
            if(this.network.toLowerCase() === "eth")
                this.gasLabel = "ETH";
            this.gasBalance = balances.gas;
            this.brdgBalance = balances.brdg;

            //Get the costs
            await this.wallet.unlock(this.passportContext.passphrase);
            this.paymentGasCost = await BridgeProtocol.Services.Blockchain.sendPayment(this.wallet, 1, BridgeProtocol.Constants.bridgeEthereumAddress, "identifier", false, true); //Get the transfer GAS cost
            this.totalGasCost = this.paymentGasCost;
            if(!this.passportPublished){
                this.publishGasCost = await BridgeProtocol.Services.Blockchain.publishPassport(this.wallet, this.passportContext.passport, true); //Need to also include the passport publish GAS cost
                this.totalGasCost = parseFloat(this.publishGasCost) + parseFloat(this.paymentGasCost);
            }

            //TODO: Factor in the passport publish fee into the GAS costs if the passport is not published yet
            if(balances.gas < this.totalGasCost){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "Insufficient balance for GAS cost.  This transaction requires " + this.totalGasCost + " " + (this.network === "neo" ? "GAS":"ETH");
            }
            if(balances.brdg < this.networkFee){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "Insufficient balance for network fees.  This transaction requires " + this.networkFee + " BRDG";
            }
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
        if(ethWallet)
            this.networks.push("eth");
        if(neoWallet)
            this.networks.push("neo");

        this.network = "neo";
        this.wallet = this.passportContext.passport.getWalletForNetwork(this.network);
        this.wallet.unlock(this.passportContext.passphrase);
        let published = await BridgeProtocol.Services.Blockchain.getPassportForAddress(this.wallet.network, this.wallet.address);
        this.passportPublished = published != null && published.length > 0;
        this.loading = false;
    }
};
</script>