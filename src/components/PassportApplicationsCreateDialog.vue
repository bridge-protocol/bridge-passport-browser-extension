<template>
    <v-dialog v-model="visible" persistent max-width="600px">
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
            <v-card-title class="title">
                <v-row>
                    <v-col cols="auto"><v-img src="../images/bridge-token.png" width="36"></v-img></v-col>
                    <v-col cols="10">New Marketplace Request</v-col>
                </v-row>
            </v-card-title>
            <v-card-text>
                <div>
                    <p>
                        Choose a marketplace partner to send a request to verify your personal information and add claims to your digital identity.
                    </p>
                    <v-row>
                        <v-col class="d-flex" cols="12">
                            <v-select
                            :items="partners"
                            hint="Select your marketplace partner"
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
                                {{networkFee}} BRDG
                            </v-col>
                        </v-row>
                        <v-alert
                            border="left"
                            colored-border
                            type="info"
                            elevation="0"
                            class="text-left mt-2 caption"
                            v-if="selectedPartner != null"
                            >
                            The Bridge Network fee and any associated gas cost for the transaction is non-refundable and does not include additional fees for service that may be required by the selected Bridge Marketplace partner.  Some Bridge Marketplace partners are third party providers that have no affiliation with Bridge Protocol Corporation and may have independent terms, conditions, and fees for service.
                        </v-alert>
                        <v-alert
                            border="left"
                            colored-border
                            type="error"
                            elevation="0"
                            class="text-left caption text-wrap mt-2"
                            v-if="insufficientBalance"
                            >
                            {{insufficientBalanceErrorMessage}}
                        </v-alert>
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="close()">Cancel</v-btn>
                <v-btn text @click="create()" :disabled="insufficientBalance" v-if="selectedPartner != null">Create Request</v-btn>
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
            publishGasCost: 0,
            paymentGasCost: 0,
            partners: []
        }
    },
    methods:{
        close: function(){
            this.$emit('close', true);
        },
        create: async function(){
            this.loading = true;
            let passportContext = await BridgeExtension.getPassportContext();

            //Make sure the passport is published / registered
            if(!this.passportPublished)
            {
                this.loadStatus = "Publishing passport to blockchain";
                console.log("Passport not published, publishing");
                await BridgeProtocol.Services.Blockchain.publishPassport(wallet, passportContext.passport);
                publish = await BridgeProtocol.Services.Blockchain.getPassportForAddress(wallet.network, wallet.address);
                if(!publish)
                {
                    alert("Could not publish passport.");
                    this.loading = false;
                    return;
                }
            }

            this.loadStatus = "Creating marketplace request";
            //Create the application via API
            let application = await BridgeProtocol.Services.Application.createApplication(passportContext.passport, passportContext.passphrase, this.selectedPartner.id);
            if(!application){
                alert("Unable to create marketplace request.");
                this.loading = false;
                return;
            }

            let applicationId = application.id;
            console.log("Request created: " + applicationId);

            //Send a blockchain fee payment
            this.loadStatus = "Sending network fee transaction";
            console.log("Sending network fee for " + applicationId);
            let wallet = passportContext.passport.getWalletForNetwork(this.network);
            await wallet.unlock(passportContext.passphrase);

            let recipient = null;
            if(wallet.network.toLowerCase() === "neo")
                recipient = BridgeProtocol.Constants.bridgeAddress;
            else if (wallet.network.toLowerCase() === "eth")
                recipient = BridgeProtocol.Constants.bridgeEthereumAddress;

            //Get the transaction id and send to the server and don't wait
            let transactionId = await BridgeProtocol.Services.Blockchain.sendPayment(wallet, this.networkFee, recipient, applicationId, false);

            //Send the fee payment info back to the application API
            application = await BridgeProtocol.Services.Application.updatePaymentTransaction(passportContext.passport, passportContext.passphrase, applicationId, wallet.network, wallet.address, transactionId);
            console.log("Request fee transaction updated: " + JSON.stringify(application));

            this.loadStatus = "Verifying network fee transaction";
            //Wait for the transaction to be done
            let status = await BridgeExtension.waitVerifyPayment(wallet.network, transactionId, wallet.address, recipient, this.networkFee, applicationId);
            console.log("Network fee transaction: " + JSON.stringify(status));

            if(status)
            {
                //Relay to the partner
                this.loadStatus = "Relaying request to partner";
                await BridgeProtocol.Services.Application.retrySend(passportContext.passport, passportContext.passphrase, application.id);
                alert("success");
            }
            else{
                alert("Payment verification failed");
            }

            
            this.$emit('created', true);
            this.loading = false;
        },
        partnerSelected: async function(partnerId){
            if(!partnerId)
                return;

            this.loading = true;
            this.loadStatus = "Loading partner information";

            let passportContext = await BridgeExtension.getPassportContext();
            this.selectedPartner = await BridgeProtocol.Services.Partner.getPartner(partnerId);
            this.selectedPartnerName = this.selectedPartner.name;
            this.networkFee = await BridgeProtocol.Services.Bridge.getBridgeNetworkFee(passportContext.passport, passportContext.passphrase);

            //Verify the balance
            let wallet = passportContext.passport.getWalletForNetwork(this.network);
            let balances = await BridgeExtension.getWalletBalances(wallet);

            //TODO: Factor in the passport publish fee into the GAS costs if the passport is not published yet
            if(balances.gas < (this.paymentGasCost + this.publishGasCost)){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "Insufficient balance for GAS cost.  This transaction requires " + (this.paymentGasCost + this.publishGasCost) + " " + (this.network === "neo" ? "GAS":"ETH");
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
        this.passportPublished = published != null;
        this.loading = false;
    }
};
</script>