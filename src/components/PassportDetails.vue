<template>
    <v-container fill-height align-start>
        <v-container class="text-left mt-0 pt-0">
            <h3 inset><v-icon class="mr-2">mdi-fingerprint</v-icon> My Digital Identity</h3>
        </v-container>
        <v-container text-center v-if="!passportLoaded">
            <v-progress-circular
                indeterminate
                color="secondary"
            ></v-progress-circular>
        </v-container>
        <v-container fill-height align-start text-center v-if="passportLoaded">
            <v-expansion-panels>
                <v-expansion-panel class="mb-2">
                    <v-expansion-panel-header class="left-border-color-primary pt-1 pb-1">
                        <v-row>
                            <v-col cols="auto"><v-img src="/images/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="auto">
                                <h3 class="mb-2">Id</h3>
                                <div v-text="passportId"></div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="left-border-color-primary">
                        <v-divider></v-divider>
                        <v-row>
                            <v-col cols="auto" text-left>Public Key:</v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="auto" 
                            style="height: 100px"
                            class="overflow-y-auto text-left text-break">
                                {{publicKey}}
                            </v-col>
                        </v-row>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-alert
                    border="left"
                    colored-border
                    type="info"
                    elevation="2"
                    class="text-left mt-2"
                    v-if="claims.length == 0"
                    >
                    No digital identity verified claims found.  To add verified claims, find a verification partner on the Bridge Marketplace.
                </v-alert>
                <v-expansion-panel
                v-for="(claim,i) in claims"
                :key="i"
                class="mb-2"
                @click="claimSelected(claim)"
                >
                    <v-expansion-panel-header class="left-border-color-primary pt-1 pb-1">
                        <v-row>
                            <v-col cols="auto"><v-img src="/images/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="auto">
                                <h3 class="mb-2" v-text="claim.claimTypeName"></h3>
                                <div v-text="claim.claimValue"></div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="left-border-color-primary">
                        <div class="text-center" v-if="!claim.loaded">
                            <v-progress-circular
                                indeterminate
                                color="secondary"
                            ></v-progress-circular>
                        </div>
                        <div v-if="claim.loaded">
                            <v-divider></v-divider>
                            <v-row>
                                <v-col cols="2" class="text-left">Verified:</v-col>
                                <v-col cols="auto">{{claim.verifiedOn}}</v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="2" class="text-left">Expires:</v-col>
                                <v-col cols="auto">{{claim.expiresOn}}</v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="2" class="text-left">Issuer:</v-col>
                                <v-col cols="auto">{{claim.signedByName}}</v-col>
                            </v-row>
                            <div v-if="claim.walletExists">
                                <v-subheader class="pl-0 ml-0">Blockchain Publishing</v-subheader>
                                <v-divider></v-divider>
                                <v-row>
                                    <v-col cols="2" class="text-left">NEO:</v-col>
                                    <v-col cols="auto" v-if="claim.neoClaim">{{JSON.stringify(claim.neoClaim)}}</v-col>
                                    <v-col cols="auto" v-if="!claim.neoClaim">Not Published</v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="2" class="text-left">Ethereum:</v-col>
                                    <v-col cols="auto" v-if="claim.ethClaim">{{JSON.stringify(claim.ethClaim)}}</v-col>
                                    <v-col cols="auto" v-if="!claim.ethClaim">Not Published</v-col>
                                </v-row>
                            </div>
                        </div>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-container>
    </v-container>
</template>

<script>
export default {
    name: 'passport-details',
    methods: {
        init: async function(){
            this.passportLoaded = false;

            this.passportId = "";
            this.publicKey = "";

            let passportContext = await BridgeExtension.getPassportContext();
            if(passportContext.passport){
                this.passportId = passportContext.passport.id;
                this.publicKey = passportContext.passport.publicKey;
            }

            this.passportLoaded = true;
        },
        claimSelected: async function(claim){
            if(this.lastSelectedClaim == claim.claimTypeId){
                this.lastSelectedClaim = "";
            }
            else{
                this.lastSelectedClaim = claim.claimTypeId;
                this.refreshClaim(claim);
            }
        },
        refreshClaim: async function(claim){
            claim.loaded = false;

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.claims.push({});
            this.claims.pop();

            try
            {
                let passportContext = await BridgeExtension.getPassportContext();
                let neoWallet = passportContext.passport.getWalletForNetwork("neo");
                let ethWallet = passportContext.passport.getWalletForNetwork("eth");
                if(neoWallet){
                    claim.walletExists = true;
                    claim.neoClaim = await BridgeProtocol.Services.Blockchain.getClaim(neoWallet.network, claim.claimTypeId, neoWallet.address);
                }
                if(ethWallet){
                    claim.walletExists = true;
                    claim.ethClaim = await BridgeProtocol.Services.Blockchain.getClaim(ethWallet.network, claim.claimTypeId, ethWallet.address);
                }  
            }
            catch(err){
                alert(err.message);
            }
            claim.loaded = true;

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.claims.push({});
            this.claims.pop();
        },
        refreshClaims: async function(){
            this.passportLoaded = false;

            this.claims = [];
            let passportContext = await BridgeExtension.getPassportContext();
            let decryptedClaims = await passportContext.passport.getDecryptedClaims(null, passportContext.passphrase);
            for(let i=0; i<decryptedClaims.length; i++)
            {   
                let created = new Date(decryptedClaims[i].createdOn * 1000); 
                decryptedClaims[i].verifiedOn = created.toLocaleDateString();

                //Find the expiration date
                if(decryptedClaims[i].expiresOn == 0)
                    decryptedClaims[i].expiresOn = "Never";
                else{
                    let expires = new Date(decryptedClaims[i].expiresOn * 1000); 
                    decryptedClaims[i].expiresOn = expires.toLocaleDateString();
                }
                    
                //Set the claim type name
                decryptedClaims[i].claimTypeName = decryptedClaims[i].claimTypeId;
                let claimType = await BridgeProtocol.Services.Claim.getType(decryptedClaims[i].claimTypeId);
                if(claimType)
                    decryptedClaims[i].claimTypeName = claimType.name;

                //Get the id it was signed by
                decryptedClaims[i].signedById = await BridgeProtocol.Utils.Crypto.getPassportIdForPublicKey(decryptedClaims[i].signedByKey);
                decryptedClaims[i].signedByName = decryptedClaims[i].signedById;
                let partner = await BridgeProtocol.Services.Partner.getPartner(decryptedClaims[i].signedById);
                if(partner)
                    decryptedClaims[i].signedByName = partner.name;
            }

            this.claims = decryptedClaims;
            this.passportLoaded = true;
        }
    },
    data: function() {
        return {
            passportId: "",
            passportLoaded: false,
            publicKey: "",
            lastSelectedClaim: "",
            claims: []
        }
    },
    created: async function(){
        await this.init();
        await this.refreshClaims();
    }
};
</script>