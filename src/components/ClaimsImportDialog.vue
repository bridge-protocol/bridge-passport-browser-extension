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
                    <v-col cols="10">Import Claims</v-col>
                </v-row>
            </v-card-title>
            <v-card-text text-center class="px-2">
                <v-container v-if="!claims || claims.length == 0">
                    No claims found to import
                </v-container>
                <v-list v-if="claims.length > 0" class="py-0">
                        <p class="subheading ">
                            Please choose the claims to be imported to your passport.  If a specified claim type already exists, it will be replaced by the imported claim.
                        </p>
                        <template 
                            v-for="(claim, i) in claims"
                            :key="claim.claimTypeId"
                        >
                        <v-divider v-if="i == 0"></v-divider>
                        <v-list-item class="left-border-color-primary mb-0">
                            <template v-slot:default="{ active, toggle }">
                                <v-list-item-action>
                                    <v-checkbox
                                        v-model="selectedClaimTypes"
                                        :id="claim.claimTypeId"
                                        :name="claim.claimTypeId"
                                        :value="claim.claimTypeId"
                                        label=""
                                        color="secondary"
                                    ></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-content class="py-0">
                                    <v-expansion-panels>
                                        <v-expansion-panel>
                                            <v-expansion-panel-header class="py-0">
                                                <v-row>
                                                    <v-col cols="auto"><v-img src="/images/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                                                    <v-col cols="auto">
                                                        <div class="mb-1 title-2" v-text="claim.claimTypeName"></div>
                                                        <div class="caption" v-text="claim.claimValue"></div>
                                                    </v-col>
                                                <v-row>
                                            </v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                    <v-subheader class="pl-0 ml-0 caption">
                                                        Claim Details 
                                                    </v-subheader>
                                                    <v-divider class="mb-2"></v-divider>
                                                    <v-row dense>
                                                        <v-col cols="2" class="text-left">Verified:</v-col>
                                                        <v-col cols="auto">{{claim.verifiedOn}}</v-col>
                                                    </v-row>
                                                    <v-row dense>
                                                        <v-col cols="2" class="text-left">Expires:</v-col>
                                                        <v-col cols="auto">{{claim.expiresOn}}</v-col>
                                                    </v-row>
                                                    <v-row dense>
                                                        <v-col cols="2" class="text-left">Issuer:</v-col>
                                                        <v-col cols="auto">{{claim.signedByName}}</v-col>
                                                    </v-row>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-list-item-content>
                            </template>
                        </v-list-item>
                        <v-divider></v-divider>
                    </template>
                </v-list>
            </v-card-text>
            <v-card-actions v-if="!loading && claims.length > 0">
                <v-spacer></v-spacer>
                <v-btn text @click="cancel()">Cancel</v-btn>
                <v-btn text @click="importClaims()">Import Claim(s)</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'claims-import-request-dialog',
    props: ['sender','request'],
    data: function () {
        return {
            visible: true,
            loading: true,
            loadStatus: "Claims import request received",
            requestMessage: null,
            messageValid: false,
            claims: [],
            verifiedClaimPackages: [],
            selectedClaimTypes: []
        }
    },
    methods:{
        verifyClaims: async function(){
            this.loading = true;

            let passportContext = await BridgeExtension.getPassportContext();

            //Verify the claims import request
            this.requestMessage = await BridgeProtocol.Messaging.Claim.verifyClaimsImportRequest(this.request);
            this.messageValid = this.requestMessage.signatureValid;

            this.loadStatus = "Verifying claim packages...";
            let claims = [];
            if(this.requestMessage.payload.claimPackages && this.requestMessage.payload.claimPackages.length > 0){
                this.verifiedClaimPackages = await BridgeProtocol.Utils.Claim.verifyClaimPackagesForImport(passportContext.passport, passportContext.passphrase, this.requestMessage.payload.claimPackages);
                for(let i=0; i<this.verifiedClaimPackages.length; i++){
                    let claim = await this.verifiedClaimPackages[i].decrypt(passportContext.passport.privateKey, passportContext.passphrase);
                    if(claim)
                        claims.push(claim);
                }
                claims = await BridgeExtension.getFullClaimsInfo(claims);
            }
            this.claims = claims;
            this.loading = false;
        },
        importClaims: async function(){
            let passportContext = await BridgeExtension.getPassportContext();
            let selectedTypes = this.selectedClaimTypes;

            //Remove the existing claims in the passport of the same type
            let claimPackages = [];
            for(let i=0; i<passportContext.passport.claims.length; i++){
                if(!selectedTypes.includes(passportContext.passport.claims[i].typeId.toString())){
                    claimPackages.push(passportContext.passport.claims[i]);
                }
            }
            passportContext.passport.claims = claimPackages;

            //Add the new claims to the passport
            let importClaimPackages = [];
            for(let i=0; i<this.verifiedClaimPackages.length; i++){
                if(selectedTypes.includes(this.verifiedClaimPackages[i].typeId.toString()))
                    importClaimPackages.push(this.verifiedClaimPackages[i]);
            }
            passportContext.passport.claims = passportContext.passport.claims.concat(importClaimPackages);

            //Save
            await BridgeExtension.savePassportToBrowserStorage(passportContext.passport);
            this.$emit('imported', true);
        },
        cancel(){
            this.$emit('cancel', true);  
        }
    },
    async created () {
        this.request;
        await this.verifyClaims();
    }
};
</script>