<template>
    <v-overlay :opacity="1">
        <v-dialog v-model="visible" persistent max-width="600px">
           <v-card>
                <v-card-title>
                    <span class="headline">Login Request Received</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" class="text-truncate">
                                {{loginRequest}}
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="login();">Login with Passport</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-overlay>
</template>

<script>
export default {
    name: 'login-request-dialog',
    props: ['sender','request'],
    data: function () {
        return {
            visible: true,
            loginRequest: null
        }
    },
    methods:{
        login: async function(){
            let passportContext = await BridgeExtension.getPassportContext();

            //The user verifies the payload and the auth request and gets details about the request
            let message = await BridgeProtocol.Messaging.Auth.verifyPassportChallengeRequest(this.loginRequest);
            console.log("Decrypted and Verified Auth Request:");
            console.log(JSON.stringify(message));
            
            //TODO: This needs to be part of a selection process on what is requested, included, etc
            var passportDetails = await BridgeProtocol.Services.Passport.getDetails(passportContext.passport, passportContext.passphrase, message.passportId);
            console.log("Requesting Passport Info:");
            console.log(JSON.stringify(passportDetails));

            //Retrieve the requested claims
            let claims = []; //await passportContext.passport.getDecryptedClaims(message.payload.claimTypes, passportContext.passphrase);
            
            //Get the requested blockchain addresses
            let addresses = []; //passportContext.passport.getWalletAddresses(message.payload.networks);

            let sender = this.sender;
            let response = await BridgeProtocol.Messaging.Auth.createPassportChallengeResponse(passportContext.passport, passportContext.passphrase, message.publicKey, message.payload.token, claims, addresses); 
            this.$emit('login', { sender, response });
        }
    },
    async created () {
        this.loginRequest = this.request;
    }
};
</script>