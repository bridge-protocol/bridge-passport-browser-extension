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
        <v-card class="mx-0 px-0" v-if="!loading">
            <v-card-title>
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
                <v-row>
                    <v-col cols="auto"><v-img src="../images/bridge-token.png" width="36"></v-img></v-col>
                    <v-col cols="10">Passport Login</v-col>
                </v-row>
            </v-card-title>
            <v-card-text>
                <p class="subheading">
                    You have been asked to login and provide information about your identity.  Select the information you want to include in your response by checking the boxes.
                </p>
                <template>
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
                        <v-subheader class="pl-0 ml-0 caption">Requested Claims</v-subheader>
                        <v-divider class="mb-2"></v-divider>
                        <v-container fluid class="mx-0 px-0 my-0 py-0" v-if="!requestedClaimTypes || requestedClaimTypes.length == 0">
                            No Claims Requested
                        </v-container>
                        <v-container fluid class="mx-0 px-0 my-0 py-0"
                            v-for="(claimType, i) in requestedClaimTypes"
                            :key="claimType.id">
                                <v-checkbox v-model="selectedClaimTypes" :label="claimType.name" :value="claimType.id" :disabled="!claimType.claim" class="px-0 mb-n4 mt-0 py-0"></v-checkbox>
                        </v-container>

                        <v-subheader class="pl-0 ml-0 caption">Requested Blockchain Addresses</v-subheader>
                        <v-divider class="mb-2"></v-divider>
                        <v-container fluid class="mx-0 px-0 my-0 py-0" v-if="!requestedAddresses || requestedAddresses.length == 0">
                            No Addresses Requested
                        </v-container>
                        <v-container class="mx-0 px-0 my-0 py-0">
                            <template 
                            v-for="(address, i) in requestedAddresses"
                            :key="address.network"
                            >   
                                <v-checkbox v-model="selectedAddresses" :label="address.networkName" :value="address.network" :disabled="!address.address" class="px-0 mb-n4 mt-0 py-0"></v-checkbox>
                            </template>
                        </v-container>
                    </v-container>
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="cancel()">Cancel</v-btn>
                <v-btn text @click="login()">Login with Passport</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'login-request-dialog',
    props: ['sender','request'],
    data: function () {
        return {
            visible: true,
            loading: true,
            loadStatus: "Login request received",
            requestMessage: null,
            messageValid: false,
            requestingPassport: null,
            requestedClaimTypes: [],
            requestedAddresses: [],
            selectedClaimTypes: [],
            selectedAddresses: []
        }
    },
    methods:{
        verify: async function(){
            let passportContext = await BridgeExtension.getPassportContext();

            this.loadStatus = "Verifying login request";

            this.requestMessage = await BridgeProtocol.Messaging.Auth.verifyPassportChallengeRequest(this.request);
            this.messageValid = this.requestMessage.signatureValid;

            let requestingPassport = await BridgeProtocol.Services.Passport.getDetails(passportContext.passport, passportContext.passphrase, this.requestMessage.passportId);
            requestingPassport.name = requestingPassport.id;
            requestingPassport.known = false;
            if(requestingPassport.partnerName && requestingPassport.partnerName.length > 0){
                requestingPassport.name = requestingPassport.partnerName;
                requestingPassport.known = true;
            }
            this.requestingPassport = requestingPassport;
            
            let requestedClaimTypes = await BridgeExtension.getClaimTypes(this.requestMessage.payload.claimTypes);
            if(requestedClaimTypes){
                for(let i=0; i<requestedClaimTypes.length; i++){
                    let claim = passportContext.passport.getClaimPackage(requestedClaimTypes[i].id);
                    requestedClaimTypes[i].claim = claim != null;
                }
            }
            this.requestedClaimTypes = requestedClaimTypes;

            let networks = [];
            if(this.requestMessage.payload.networks){
                for(let i=0; i<this.requestMessage.payload.networks.length; i++){
                    let network = this.requestMessage.payload.networks[i];
                    let networkName = this.requestMessage.payload.networks[i];
                    let wallet = passportContext.passport.getWalletForNetwork(network);
                    let address = null;
                    if(wallet)
                        address = true;

                    if(network.toLowerCase() === "neo")
                        networkName = "NEO";
                    else if(network.toLowerCase() === "eth")
                        networkName = "Ethereum";

                    networks.push({network, networkName, address});
                }
            }

            this.requestedAddresses = networks;
            this.loading = false;
        },
        login: async function(){
            this.loading = true;
            this.loadStatus = "Packaging claims";

            let passportContext = await BridgeExtension.getPassportContext();

            //Retrieve the requested claims
            let claims = [];
            if(this.selectedClaimTypes && this.selectedClaimTypes.length > 0)
                claims = await passportContext.passport.getDecryptedClaims(this.selectedClaimTypes, passportContext.passphrase);
            
            //Get the requested blockchain addresses
            let addresses = [];
            if(this.selectedAddresses && this.selectedAddresses.length > 0)
                addresses = passportContext.passport.getWalletAddresses(this.selectedAddresses);

            this.loadStatus = "Sending login response";
            let sender = this.sender;
            let response = await BridgeProtocol.Messaging.Auth.createPassportChallengeResponse(passportContext.passport, passportContext.passphrase, this.requestMessage.publicKey, this.requestMessage.payload.token, claims, addresses); 
            this.$emit('login', { sender, response });
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