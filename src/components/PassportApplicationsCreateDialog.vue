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
                                Network Fee
                            </v-col>
                            <v-col cols="1"><v-img src="/images/bridge-token.png" width="20" contain></v-img></v-col>
                            <v-col cols="auto">
                                {{networkFee}} BRDG ({{brdgBalance}} Available)
                            </v-col>
                        </v-row>
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
                <v-btn color="secondary" @click="create()" :disabled="insufficientBalance" v-if="selectedPartner != null">Create Request</v-btn>
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
            passportPublished: false,
            selectedPartner: null,
            selectedPartnerName: "",
            network: "eth",
            networkFee: 0,
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
                let passportContext = await BridgeExtension.getPassportContext();
                let wallet = passportContext.passport.getWalletForNetwork(app.network);
                await wallet.unlock(passportContext.passphrase);

                //Make sure the passport is published / registered
                if(!app.passportPublished)
                {
                    app.loadStatus = "Publishing passport to blockchain";
                    console.log("Passport not published, publishing");
                    
                    await BridgeProtocol.Services.Blockchain.publishPassport(wallet, passportContext.passport);
                    let publish = await BridgeProtocol.Services.Blockchain.getPassportForAddress(wallet.network, wallet.address);
                    if(!publish)
                    {
                        alert("Could not publish passport.");
                        app.loading = false;
                        return;
                    }
                }

                app.loadStatus = "Creating marketplace request";
                //Create the application via API
                let application = await BridgeProtocol.Services.Application.createApplication(passportContext.passport, passportContext.passphrase, app.selectedPartner.id);
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
                if(wallet.network.toLowerCase() === "neo")
                    recipient = BridgeProtocol.Constants.bridgeAddress;
                else if (wallet.network.toLowerCase() === "eth")
                    recipient = BridgeProtocol.Constants.bridgeEthereumAddress;

                //Get the transaction id and send to the server and don't wait
                let transactionId = await BridgeProtocol.Services.Blockchain.sendPayment(wallet, app.networkFee, recipient, applicationId, false);

                //Send the fee payment info back to the application API
                application = await BridgeProtocol.Services.Application.updatePaymentTransaction(passportContext.passport, passportContext.passphrase, applicationId, wallet.network, wallet.address, transactionId);
                console.log("Request fee transaction updated: " + JSON.stringify(application));

                app.loadStatus = "Verifying network fee transaction";
                //Wait for the transaction to be done
                let status = await BridgeExtension.waitVerifyPayment(wallet.network, transactionId, wallet.address, recipient, app.networkFee, applicationId);
                console.log("Network fee transaction: " + JSON.stringify(status));

                if(status)
                {
                    //Relay to the partner
                    app.loadStatus = "Relaying request to partner";
                    await BridgeProtocol.Services.Application.retrySend(passportContext.passport, passportContext.passphrase, application.id);
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
            let passportContext = await BridgeExtension.getPassportContext();
            this.selectedPartner = await BridgeProtocol.Services.Partner.getPartner(partnerId);
            this.selectedPartnerName = this.selectedPartner.name;
            
            //Verify the balance
            let wallet = passportContext.passport.getWalletForNetwork(this.network);
            let balances = await BridgeExtension.getWalletBalances(wallet);
            this.gasBalance = balances.gas;
            this.brdgBalance = balances.brdg;

            //Get the costs
            await wallet.unlock(passportContext.passphrase);
            this.paymentGasCost = await BridgeProtocol.Services.Blockchain.sendPayment(wallet, 1, BridgeProtocol.Constants.bridgeEthereumAddress, "identifier", false, true); //Get the transfer GAS cost
            this.totalGasCost = this.paymentGasCost;
            if(!this.passportPublished){
                this.publishGasCost = await BridgeProtocol.Services.Blockchain.publishPassport(wallet, passportContext.passport, true); //Need to also include the passport publish GAS cost
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
        this.partners = await BridgeProtocol.Services.Partner.getAllPartners();
        let passportContext = await BridgeExtension.getPassportContext();
        let wallet = passportContext.passport.getWalletForNetwork(this.network);
        if(!wallet)
        {
            alert("No " + this.network.toUpperCase() + " wallet found.  Please add a wallet and funds.");
            this.$emit('close', true);
            return;
        }
        let published = await BridgeProtocol.Services.Blockchain.getPassportForAddress(wallet.network, wallet.address);
        this.passportPublished = published != null && published.length > 0;
        this.networkFee = await BridgeProtocol.Services.Bridge.getBridgeNetworkFee(passportContext.passport, passportContext.passphrase);
        this.loading = false;
    }
};
</script>