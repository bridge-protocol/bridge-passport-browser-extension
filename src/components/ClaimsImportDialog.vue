<template>
    <v-overlay :opacity="1">
        <v-dialog v-model="visible" persistent max-width="600px">
           <v-card>
                <v-card-title>
                    <span class="headline">Claims Import Request Received</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" class="text-truncate">
                                {{importRequest}}
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="login();">Import Claim(s)</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-overlay>
</template>

<script>
export default {
    name: 'claims-import-request-dialog',
    props: ['sender','request'],
    data: function () {
        return {
            visible: true,
            importRequest: null
        }
    },
    methods:{
        login: async function(){
            let passportContext = await BridgeExtension.getPassportContext();

            //Verify the claims import request
            let verifiedImportRequest = await BridgeProtocol.Messaging.Claim.verifyClaimsImportRequest(this.importRequest);
            console.log("Verified Import Request:");
            console.log(JSON.stringify(verifiedImportRequest));

            let verifiedClaimPackages = await BridgeProtocol.Utils.Claim.verifyClaimPackagesForImport(passportContext.passport, passportContext.passphrase, verifiedImportRequest.payload.claimPackages);
            console.log("Verified Claim Packages:");
            console.log(JSON.stringify(verifiedClaimPackages));

            //TODO: Replace existing claims of the same type

            //Add the claims to the passport, usually the user would approve these for import, etc.
            passportContext.passport.claims = passportContext.passport.claims.concat(verifiedClaimPackages);
            console.log("Passport Claim Packages:");
            console.log(JSON.stringify(passportContext.passport.claims));

            //Save
            await BridgeExtension.savePassportToBrowserStorage(passportContext.passport);
            this.$emit('close', true);
        }
    },
    async created () {
        this.importRequest = this.request;
    }
};
</script>