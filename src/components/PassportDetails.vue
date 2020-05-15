<template>
    <v-container fill-height align-start text-center class="mx-0 my-0 px-0 py-0" ref="mainContainer">
        <v-container v-if="refreshing" fill-height align-middle class="mx-0 my-0 px-0 py-0">
            <v-progress-circular
                indeterminate
                color="secondary"
                style="margin-left: 50%;"
            ></v-progress-circular>
        </v-container>
        <v-container v-if="!refreshing" fill-height align-start px-0 py-0 mx-0 my-0 :style="'max-height:' + mainContainerHeight + 'px; overflow-y:auto;'">
            <v-expansion-panels>
                <v-expansion-panel>
                    <v-expansion-panel-header class="left-border-color-primary pt-1 pb-1">
                        <v-row>
                            <v-col cols="auto"><v-img src="/images/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="auto">
                                <div class="mb-1 title-2">Id</div>
                                <div class="caption" v-text="passportId"></div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="left-border-color-primary">
                        <v-subheader class="pl-0 ml-0 caption">Passport Details</v-subheader>
                        <v-divider class="mb-2"></v-divider>
                        <v-row class="mb-n4">
                            <v-col cols="2" class="text-left">Version:</v-col>
                            <v-col cols="auto" class="text-left">{{version}}</v-col>
                        </v-row>
                        <v-row class="mb-n4">
                            <v-col cols="2" class="text-left">Id:</v-col>
                            <v-col cols="auto" class="text-left">{{passportId}}</v-col>
                        </v-row>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-alert
                    border="left"
                    colored-border
                    type="info"
                    elevation="2"
                    class="caption text-left mt-2"
                    v-if="claims.length == 0"
                    >
                    No digital identity verified claims found.  To add verified claims, create a Bridge Marketplace request. <a @click="navigateToMarketplace">Go to My Marketplace Requests</a>
                </v-alert>
                <v-expansion-panel
                v-for="(claim,i) in claims"
                :key="claim.id"
                @click="claimSelected(claim)"
                >
                    <v-expansion-panel-header class="left-border-color-primary pt-1 pb-1">
                        <v-row>
                            <v-col cols="auto"><v-img src="/images/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="auto">
                                <div class="mb-1 title-2" v-text="claim.claimTypeName"></div>
                                <div class="caption" v-text="claim.claimValue"></div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="left-border-color-primary">
                        <v-container fluid>
                            <div class="float-right">
                                <v-menu close-on-click small bottom left>
                                        <template v-slot:activator="{ on }">
                                            <v-btn
                                                icon
                                                v-on="on"
                                                class="ml-12"
                                            >
                                                <v-icon small>mdi-dots-vertical</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-list dense>
                                            <v-list-item two-line @click="showPublishClaimDialog(claim)">
                                                <v-list-item-icon>
                                                <v-icon>mdi-publish</v-icon>
                                                </v-list-item-icon>
                                                <v-list-item-content>
                                                <v-list-item-title>Publish to Blockchain</v-list-item-title>
                                                <v-list-item-subtitle>
                                                    Publish the claim data or hash to the blockchain
                                                </v-list-item-subtitle>
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-divider v-if="(neoWallet && !claim.neoClaim) || (ethWallet && !claim.ethClaim)"></v-divider>
                                            <v-list-item two-line @click="removeClaim(claim)" :disabled="claim.neoClaim != null || claim.ethClaim != null">
                                                <v-list-item-icon>
                                                <v-icon>mdi-delete</v-icon>
                                                </v-list-item-icon>
                                                <v-list-item-content>
                                                <v-list-item-title>Delete Claim</v-list-item-title>
                                                <v-list-item-subtitle>
                                                    Remove the claim from your passport
                                                </v-list-item-subtitle>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                </v-menu>
                            </div>
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
                            <div v-if="neoWallet != null || ethWallet != null">
                                <v-subheader class="pl-0 ml-0 caption">Blockchain Claims</v-subheader>
                                <v-divider class="mb-2"></v-divider>
                                <v-row dense v-if="neoWallet != null">
                                    <v-col cols="1" class="text-left">
                                        <v-img :src="'/images/neo-logo.png'" height="20" contain></v-img>
                                    </v-col>
                                    <v-col cols="11" v-if="!claim.neoLoading">
                                        <v-row v-if="claim.neoClaim" class="mt-n3">
                                            <v-col cols="2">{{getDate(claim.neoClaim.date)}}</v-col>
                                            <v-col cols="8" class="text-left text-break">{{claim.neoClaim.value}}</v-col>
                                            <v-col cols="1" class="text-left text=break" v-if="claim.neoVerified"><v-icon small color="success">mdi-check-decagram</v-icon></v-col>
                                            <v-col cols="1"><v-btn @click="unpublishClaim(claim, 'neo')" icon x-small :loading="neoWait"><v-icon>mdi-delete-forever</v-icon></v-btn></v-col>
                                        </v-row>
                                        <v-container class="text-left px-0 py-0 mx-0 my-0" v-if="!claim.neoClaim">
                                            Not Published 
                                        </v-container>
                                    </v-col>
                                    <v-col cols="auto" v-if="claim.neoLoading">
                                        <v-progress-circular
                                            indeterminate
                                            color="secondary"
                                            size="16"
                                            width="2"
                                        ></v-progress-circular>
                                    </v-col>
                                </v-row>
                                <v-row dense v-if="ethWallet != null">
                                    <v-col cols="1" class="text-left">
                                        <v-img :src="'/images/eth-logo.png'" height="20" contain></v-img>
                                    </v-col>
                                    <v-col cols="11" v-if="!claim.ethLoading">
                                        <v-row v-if="claim.ethClaim" class="mt-n3">
                                            <v-col cols="2">{{getDate(claim.ethClaim.date)}}</v-col>
                                            <v-col cols="8" class="text-left text=break">{{claim.ethClaim.value}}</v-col>
                                            <v-col cols="1" class="text-left text=break" v-if="claim.ethVerified"><v-icon small color="success">mdi-check-decagram</v-icon></v-col>
                                            <v-col cols="1"><v-btn @click="unpublishClaim(claim, 'eth')" icon x-small :loading="ethWait"><v-icon>mdi-delete-forever</v-icon></v-btn></v-col>
                                        </v-row>
                                        <v-container class="text-left px-0 py-0 mx-0 my-0" v-if="!claim.ethClaim">
                                            Not Published                                         
                                        </v-container>
                                    </v-col>
                                    <v-col cols="auto" v-if="claim.ethLoading">
                                        <v-progress-circular
                                            indeterminate
                                            color="secondary"
                                            size="16"
                                            width="2"
                                        ></v-progress-circular>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-container>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-container>
        <blockchain-publish-dialog v-if="publishDialog" :claim="publishClaim" :network="publishNetwork" @published="claimPublished" @cancel="publishDialog = false"></blockchain-publish-dialog>
    </v-container>
</template>

<script>
import BlockchainPublishDialog from '../components/PassportBlockchainPublishDialog.vue';
export default {
    name: 'passport-details',
     components: {
         BlockchainPublishDialog
    },
    methods: {
        init: async function(){
            this.refreshing = true;

            this.passportId = "";
            this.publicKey = "";

            let passportContext = await BridgeExtension.getPassportContext();
            if(passportContext.passport){
                this.passportId = passportContext.passport.id;
                this.publicKey = passportContext.passport.publicKey;
                this.version = BridgeExtension.passportVersion;
            }

            this.neoWallet = passportContext.passport.getWalletForNetwork("neo");
            this.ethWallet = passportContext.passport.getWalletForNetwork("eth");
            this.refreshing = false;
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
            claim.neoLoading = true;
            claim.ethLoading = true;

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.claims.push({});
            this.claims.pop();

            let passportContext = await BridgeExtension.getPassportContext();
            try
            {
                if(this.neoWallet){
                    let neoWallet = passportContext.passport.getWalletForNetwork("neo");
                    let res = await BridgeProtocol.Services.Blockchain.getClaim(this.neoWallet.network, claim.claimTypeId, this.neoWallet.address);
                    if(res.claim){
                        claim.neoClaim = res.claim;
                        claim.neoVerified = res.verified;
                    }
                    claim.neoLoading = false;
                }
                if(this.ethWallet){
                    let ethWallet = passportContext.passport.getWalletForNetwork("eth");
                    let res = await BridgeProtocol.Services.Blockchain.getClaim(this.ethWallet.network, claim.claimTypeId, this.ethWallet.address);
                    if(res.claim){
                        claim.ethClaim = res.claim;
                        claim.ethVerified = res.verified;
                    }
                    claim.ethLoading = false;
                }  
            }
            catch(err){
                alert(err.message);
            }

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.claims.push({});
            this.claims.pop();
        },
        refreshClaims: async function(){
            this.refreshing = true;

            this.claims = [];
            let passportContext = await BridgeExtension.getPassportContext();
            let decryptedClaims = await passportContext.passport.getDecryptedClaims(null, passportContext.passphrase);

            //Update with all the user friendly info
            this.claims = await BridgeExtension.getFullClaimsInfo(decryptedClaims);
            this.refreshing = false;
        },
        async removeClaim(claim){
            let publishedClaim = false;
            let passportContext = await BridgeExtension.getPassportContext();

            if(claim.neoClaim != null || claim.ethClaim != null){
                alert("Please unpublish the claim from blockchains to continue.");
                return;
            }

            //Remove the sourcce claim package from the passport and save
            let claimPackages = [];
            for(let i=0; i<passportContext.passport.claims.length; i++){
                if(passportContext.passport.claims[i].typeId != claim.claimTypeId)
                    claimPackages.push(passportContext.passport.claims[i]);
            }
            passportContext.passport.claims = claimPackages;
            await BridgeExtension.savePassportToBrowserStorage(passportContext.passport);

            //Remove the decrypted claim from our UI collection to prevent the full refresh
            let claims = [];
            for(let i=0; i<this.claims.length; i++){
                if(this.claims[i].claimTypeId != claim.claimTypeId)
                    claims.push(this.claims[i]);
                else
                    console.log("Excluding " + this.claims[i].typeId + " " + claim.claimTypeId);
            }
            this.claims = claims;
        },
        getDate(date){
            return BridgeExtension.getReadableDate(date);
        },
        async unpublishClaim(claim, network){
            if(network.toLowerCase() === "neo")
                this.neoWait = true;
            else if(network.toLowerCase() === "eth")
                this.ethWait = true;

            let passportContext = await BridgeExtension.getPassportContext();
            let wallet = passportContext.passport.getWalletForNetwork(network);
            await wallet.unlock(passportContext.passphrase);
            await BridgeProtocol.Services.Blockchain.removeClaim(wallet, claim.claimTypeId);
            this.refreshClaim(claim);

            this.neoWait = false;
            this.ethWait = false;
        },
        navigateToMarketplace(){
            this.$emit('showMarketplace', true);
        },
        async showPublishClaimDialog(claim){
            this.lastSelectedClaim = "";
            this.publishClaim = claim;
            this.publishDialog = true;
        },
        async claimPublished(publishedClaim){
            this.publishClaim = null;
            this.publishDialog = false;
        }
    },
    data: function() {
        return {
            mainContainerHeight: 690,
            passportId: "",
            version: null,
            publicKey: "",
            lastSelectedClaim: "",
            neoWallet: null,
            ethWallet: null,
            neoWait: false,
            ethWait: false,
            refreshing: true,
            claims: [],
            publishClaim: null,
            publishDialog: false
        }
    },
    created: async function(){
        await this.init();
        await this.refreshClaims();
        this.mainContainerHeight = this.$refs.mainContainer.clientHeight;
    }
};
</script>