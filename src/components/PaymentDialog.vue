<template>
    <v-overlay v-model="visible" persistent opacity=".95">
        <v-container elevation="0" v-if="loading" text-center align-middle>
            <v-row><v-col cols="12" class="text-center"><v-img :src="'/images/spinner.svg'" height="80" contain></v-img></v-col></v-row>
            <v-row><v-col cols="12" class="text-center"><div>{{loadStatus}}</div></v-col></v-row>
        </v-container>  
        <v-card class="mx-4 px-0" v-if="!loading">
            <v-toolbar
                color="gradient"
                dark
                >
                <v-toolbar-title class="subtitle-1">Token Payment Request</v-toolbar-title>
            </v-toolbar>
            <v-alert
                border="left"
                colored-border
                type="warning"
                elevation="0"
                class="text-left caption text-wrap mx-n6 mt-n4"
                v-if="!messageValid"
                >
                Request integrity check failed.  This request may be forged, proceed with caution.
            </v-alert>
            <v-card-text>
                <p class="subheading mt-4">
                    You have been asked make a BRDG token payment.  Please review the payment information.
                </p>
                <v-container fluid class="px-0 mt-n6">
                    <v-subheader class="pl-0 ml-0 caption">Requesting Passport Identity</v-subheader>
                    <v-divider class="mb-2"></v-divider>
                    <v-container fluid class="mx-0 px-0 my-n2 py-0">
                        <v-row>
                            <v-col cols="auto">
                                <span v-if="requestingPassport.known"><v-icon small color="success">mdi-check-decagram</v-icon> {{requestingPassport.name}}</span><span v-if="!requestingPassport.known"><v-icon small color="warning">mdi-alert</v-icon> Unknown Passport ({{requestingPassport.id}})</span> 
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-subheader class="pl-0 ml-0 mt-4 caption">Payment Information</v-subheader>
                    <v-divider class="mb-2"></v-divider>
                    <v-container fluid class="mx-0 px-0 my-n2 py-0">
                        <v-row>
                            <v-col cols="2">
                                Address
                            </v-col>
                            <v-col cols="auto">
                                {{requestAddress}} <v-btn @click="openUrl(requestAddressUrl)" x-small color="accent" :loading="unlocking" class="ml-2">View</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="2">
                                Network
                            </v-col>
                            <v-col cols="1">
                                <v-img :src="'../images/' + requestNetwork + '-logo.png'" width="18"></v-img>
                            </v-col>
                            <v-col cols="auto" class="pl-0">
                                {{requestNetworkName}}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="2">
                                Amount
                            </v-col>
                            <v-col cols="1">
                                <v-img src="/images/bridge-token.png" width="20" contain></v-img>
                            </v-col>
                            <v-col cols="auto" class="pl-0">
                                {{requestAmount}} BRDG ({{brdgBalance}} available)
                            </v-col>
                        </v-row>
                        <v-row v-if="requestNetwork === 'eth'">
                            <v-col cols="2">
                                GAS
                            </v-col>
                            <v-col cols="1">
                                <v-img src="/images/eth-logo.png" width="20" contain></v-img>
                            </v-col>
                            <v-col cols="auto" class="pl-0">
                                {{requestGas}} ETH ({{gasBalance}} available)
                            </v-col>
                        </v-row>
                    </v-container>
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
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="cancel();">Cancel</v-btn>
                <v-btn color="accent" @click="pay();" :disabled="insufficientBalance">Make Payment</v-btn>
            </v-card-actions>
        </v-card>
    </v-overlay>
</template>

<script>
export default {
    name: 'payment-request-dialog',
    props: ['sender','request'],
    data: function () {
        return {
            visible: true,
            loading: true,
            loadStatus: "Payment request received",
            messageValid: false,
            requestPublicKey: null,
            requestMessage: null,
            requestingPassport: null,
            requestNetwork: null,
            requestNetworkName: null,
            requestAmount: null,
            requestGas: 0,
            requestAddress: null,
            requestAddressUrl: null,
            requestIdentifier: null,
            brdgBalance: 0,
            gasBalance: 0,
            insufficientBalance: false,
            insufficientBalanceErrorMessage: "Insufficient balance to make payment"
        }
    },
    methods:{
        verify: async function(){
            this.loading = true;
            this.loadStatus = "Verifying payment request";

            let passportContext = await BridgeExtension.getPassportContext();
            this.requestMessage = await BridgeProtocol.Messaging.Payment.verifyPaymentRequest(this.request);
            this.messageValid = this.requestMessage.signatureValid;
            
            this.requestPublicKey = this.requestMessage.publicKey;
            this.requestAmount = this.requestMessage.payload.amount;
            this.requestAddress = this.requestMessage.payload.address;
            this.requestIdentifier = this.requestMessage.payload.identifier;
            this.requestNetwork = this.requestMessage.payload.network.toLowerCase();
            if(this.requestNetwork === "neo"){
                this.requestNetworkName = "Neo";
                this.requestAddressUrl = BridgeProtocol.Constants.neoscanUrl + "address/" + this.requestAddress;
            }
            else if(this.requestNetwork === "eth"){
                this.requestNetworkName = "Ethereum";
                this.requestAddressUrl = BridgeProtocol.Constants.etherscanUrl + "/address/" + this.requestAddress;
            }
            else if(this.requestNetwork === "bsc"){
                this.requestNetworkName = "Binance Smart Chain";
                this.requestAddressUrl = BridgeProtocol.Constants.bscScanUrl + "/address/" + this.requestAddress;
            }

            let requestingPassport = await BridgeProtocol.Services.Passport.getDetails(passportContext.passport, passportContext.passphrase, this.requestMessage.passportId);
            requestingPassport.name = requestingPassport.id;
            requestingPassport.known = false;
            if(requestingPassport.partnerName && requestingPassport.partnerName.length > 0){
                requestingPassport.name = requestingPassport.partnerName;
                requestingPassport.known = true;
            }
            this.requestingPassport = requestingPassport;

            //Check the balances
            let wallet = passportContext.passport.getWalletForNetwork(this.requestNetwork);
            await wallet.unlock(passportContext.passphrase);

            let balances = await BridgeExtension.getWalletBalances(wallet);
            this.requestGas = await BridgeProtocol.Services.Blockchain.sendPayment(wallet, this.requestAmount, this.requestAddress, this.requestIdentifier, false, true); //Get the transfer GAS cost
            this.brdgBalance = balances.brdg;
            this.gasBalance = balances.gas;

            if(balances.gas < this.requestGas){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "Insufficient balance for payment.  This transaction requires " + this.requestGas + " " + this.requestNetwork === "neo" ? "GAS":"ETH";
            }
            if(balances.brdg < this.requestAmount){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "Insufficient balance for payment.  This transaction requires " + this.requestAmount + " BRDG";
            }
                
            this.loading = false;
        },
        pay: async function(){
            let app = this;
            app.loading = true;
            app.loadStatus = "Creating and sending payment transaction";
            //Allow UI to refresh with spinner
            window.setTimeout(async function(){
                let passportContext = await BridgeExtension.getPassportContext();

                //Unlock the wallet
                let wallet = passportContext.passport.getWalletForNetwork(app.requestNetwork);
                await wallet.unlock(passportContext.passphrase);
                
                //Transmit the transaction
                let transactionId = await BridgeProtocol.Services.Blockchain.sendPayment(wallet, app.requestAmount, app.requestAddress, app.requestIdentifier, false);
                if(!transactionId){
                alert("Transaction failed. See console for details.");
                return;
                }
                
                app.loadStatus = "Transaction " + transactionId + " sent successfully";
                //Create response message
                let response = await BridgeProtocol.Messaging.Payment.createPaymentResponse(passportContext.passport, passportContext.passphrase, app.requestNetwork, wallet.address, app.requestAmount, app.requestAddress, app.requestIdentifier, transactionId, app.requestPublicKey);
                app.$emit('paymentSent', { sender: app.sender, response });
            },100);
        },
        openUrl: function(url){
            this.$emit('openUrl', url);
        },
        cancel: async function(){
            this.$emit('cancel', true);
        }
    },
    async created () {
        this.verify();
    }
};
</script>