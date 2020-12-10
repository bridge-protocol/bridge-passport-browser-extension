<template>
    <v-container fill-height align-start text-center class="mx-0 my-0 px-0 py-0" ref="mainContainer">
        <v-container v-if="refreshing" fill-height align-middle class="mx-0 my-12 px-0 py-12">
            <v-progress-circular
                indeterminate
                color="secondary"
                style="margin-left: 48%;"
            >
            <div class="pt-4 mt-12 text-no-wrap">
                {{loadStatus}}
            </div>
            </v-progress-circular>
        </v-container>
        <v-container v-if="!refreshing" fill-height align-start px-0 py-0 mx-0 my-0 :style="'height:' + minContainerHeight + 'px; overflow-y:auto;'">
            <v-expansion-panels>
                <v-expansion-panel @click="passportDetail">
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
                        <div v-if="neoWallet != null || ethWallet != null">
                            <div class="float-right">
                                <v-menu close-on-click small bottom left>
                                        <template v-slot:activator="{ on }">
                                            <v-btn
                                                icon
                                                v-on="on"
                                                class="ml-12 mt-3"
                                            >
                                                <v-icon small>mdi-dots-vertical</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-list dense>
                                            <v-list-item two-line @click="showPublishDialog()">
                                                <v-list-item-icon>
                                                <v-icon>mdi-publish</v-icon>
                                                </v-list-item-icon>
                                                <v-list-item-content>
                                                <v-list-item-title>Publish to Blockchain</v-list-item-title>
                                                <v-list-item-subtitle>
                                                    Publish the passport to the blockchain
                                                </v-list-item-subtitle>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                </v-menu>
                            </div>
                            <v-subheader class="pl-0 ml-0 mt-2 caption">Blockchain Publishing</v-subheader>
                            <v-divider class="mb-2"></v-divider>
                            <v-row dense v-if="neoWallet != null">
                                <v-col cols="1" class="text-left">
                                    <v-img :src="'/images/neo-logo.png'" height="20" contain></v-img>
                                </v-col>
                                <v-col cols="9" class="text-left" v-if="!passportNeoLoading">
                                    <span v-if="passportNeoPublished">Published </span>
                                    <span v-if="passportNeoPending">Publish Pending
                                        <v-progress-circular
                                            indeterminate
                                            color="secondary"
                                            size="12"
                                            width="2"
                                            class="ml-1"
                                        ></v-progress-circular>
                                    </span>
                                    <span v-if="!passportNeoPublished && !passportNeoPending">Not Published </span>
                                </v-col>
                                <v-col cols="auto" v-if="passportNeoLoading">
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
                                <v-col cols="9" class="text-left" v-if="!passportEthLoading">
                                    <span v-if="passportEthPublished">Published</span>
                                    <span v-if="passportEthPending">Publish Pending
                                        <v-progress-circular
                                        indeterminate
                                        color="secondary"
                                        size="12"
                                        width="2"
                                        class="ml-1"
                                        ></v-progress-circular>
                                        <v-btn text @click="openUrl('https://etherscan.io/address/' + ethWallet.address);" x-small color="accent" class="pl-0 ml-4">View on Etherscan</v-btn>
                                    </span>
                                    <span v-if="!passportEthPublished && !passportEthPending">Not Published </span>
                                </v-col>
                                <v-col cols="auto" v-if="passportEthLoading">
                                    <v-progress-circular
                                        indeterminate
                                        color="secondary"
                                        size="16"
                                        width="2"
                                    ></v-progress-circular>
                                </v-col>
                            </v-row>
                        </div>
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
                                <v-col cols="auto">{{claim.expireDate}}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Issuer:</v-col>
                                <v-col cols="auto">{{claim.signedByName}}</v-col>
                            </v-row>
                            <div v-if="neoWallet != null || ethWallet != null">
                                <div class="float-right">
                                    <v-menu close-on-click small bottom left>
                                            <template v-slot:activator="{ on }">
                                                <v-btn
                                                    icon
                                                    v-on="on"
                                                    class="ml-12 mt-3"
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
                                            </v-list>
                                    </v-menu>
                                </div>
                                <v-subheader class="pl-0 ml-0 caption">Blockchain Claims</v-subheader>
                                <v-divider class="mb-2"></v-divider>
                                <v-row dense v-if="neoWallet != null">
                                    <v-col cols="1" class="text-left">
                                        <v-img :src="'/images/neo-logo.png'" height="20" contain></v-img>
                                    </v-col>
                                    <v-col cols="11" class="text-left" v-if="!claim.neoLoading && claim.neoPublish">
                                        {{claim.neoPublish != null ? claim.neoPublish.text : null}} 
                                        <v-btn v-if="claim.neoPublish != null  && claim.neoPublish.status == 3" x-small class="accent ml-1" @click="sendNeoClaimTransaction(claim)" :loading="neoPublishing">Publish</v-btn>
                                        <v-progress-circular
                                        indeterminate
                                        color="secondary"
                                        size="12"
                                        width="2"
                                        class="ml-1"
                                        v-if="claim.neoPublish != null && claim.neoPublish.status == 2"
                                        ></v-progress-circular>
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
                                    <v-col cols="11" class="text-left" v-if="!claim.ethLoading">
                                        {{claim.ethPublish != null ? claim.ethPublish.text : null}}
                                        <v-progress-circular
                                        indeterminate
                                        color="secondary"
                                        size="12"
                                        width="2"
                                        class="ml-1"
                                        v-if="claim.ethPublish != null && claim.ethPublish.status == 2"
                                        ></v-progress-circular>
                                        <v-btn text v-if="claim.ethPublish != null && claim.ethPublish.txId != null" @click="openUrl('https://etherscan.io/tx/' + claim.ethPublish.txId);" x-small color="accent" class="pl-0 ml-4">View on Etherscan</v-btn>
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
        <blockchain-publish-dialog v-if="publishDialog" :network="publishNetwork" @published="passportPublished" @cancel="publishDialog = false"></blockchain-publish-dialog>
        <blockchain-claim-publish-dialog v-if="publishClaimDialog" :claim="publishClaim" :network="publishNetwork" @published="claimPublished" @cancel="publishClaimDialog = false" @publishPassport="showPublishDialog"></blockchain-claim-publish-dialog>
    </v-container>
</template>

<script>
import BlockchainPublishDialog from '../components/PassportBlockchainPublishDialog.vue';
import BlockchainClaimPublishDialog from '../components/PassportBlockchainClaimPublishDialog.vue';
export default {
    name: 'passport-details',
    components: {
        BlockchainPublishDialog,
        BlockchainClaimPublishDialog
    },
    data: function() {
        return {
            loadStatus: "Please Wait",
            mainContainerHeight: 985,
            passportId: "",
            passportDetailSelected: false,
            passportNeoLoading: false,
            passportEthLoading: false,
            passportNeoPending: false,
            passportEthPending: false,
            passportNeoPublished: false,
            passportEthPublished: false,
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
            publishDialog: false,
            publishClaimDialog: false,
            polling: false,
            neoPublishing: false
        }
    },
    methods: {
        init: async function(){
            this.refreshing = true;
            this.passportId = "";
            this.publicKey = "";

            this.passportContext = await BridgeExtension.getPassportContext();
            this.passportId = this.passportContext.passport.id;
            this.publicKey = this.passportContext.passport.publicKey;
            this.version = BridgeExtension.passportVersion;

            this.neoWallet = this.passportContext.passport.getWalletForNetwork("neo");
            this.ethWallet = this.passportContext.passport.getWalletForNetwork("eth");
            this.refreshing = false;
        },
        refreshClaims: async function(){
            this.refreshing = true;

            this.claims = [];

            this.loadStatus = "Decrypting Identity Claims";
            let passportContext = await BridgeExtension.getPassportContext();
            let decryptedClaims = await passportContext.passport.getDecryptedClaims(null, passportContext.passphrase);

            //Update with all the user friendly info
            this.claims = await BridgeExtension.getFullClaimsInfo(decryptedClaims);

            this.loadStatus = "";
            this.refreshing = false;
        },
        passportDetail: async function(){
            this.polling = false;
            this.passportDetailSelected = !this.passportDetailSelected;
            if(this.passportDetailSelected){
                await this.refreshPassportDetail();
            }
        },
        claimSelected: async function(claim){
            this.polling = false;
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

            //See if it's published on NEO if we have a NEO wallet
            if(this.neoWallet){
                claim.neoPublish = await BridgeExtension.getBlockchainClaimPublishStatus(this.passportContext.passport, this.passportContext.passphrase, this.neoWallet, claim.claimTypeId);
                claim.neoLoading = false;
                //If we are pending, poll to keep the status updated
                if(claim.neoPublish.status == 2)
                    this.pollPublishStatus(this.neoWallet, claim);
            }
                
            //See if it's published on Ethereum if we have an Ethereum wallet
            if(this.ethWallet){
                claim.ethPublish = await BridgeExtension.getBlockchainClaimPublishStatus(this.passportContext.passport, this.passportContext.passphrase, this.ethWallet, claim.claimTypeId);
                claim.ethLoading = false;
                //If we are pending, poll to keep the status updated
                if(claim.ethPublish.status == 2)
                    this.pollPublishStatus(this.ethWallet, claim);
            }

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.claims.push({});
            this.claims.pop();

            claim.neoLoading = false;
            claim.ethLoading = false;
        },
        async pollPublishStatus(wallet, claim){
            if(wallet.network.toLowerCase() === "neo")
                claim.neoPublish = await this.pollClaimPublishStatus(wallet, claim.claimTypeId);
            else
                claim.ethPublish = await this.pollClaimPublishStatus(wallet, claim.claimTypeId);

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.claims.push({});
            this.claims.pop();
        },
        async pollClaimPublishStatus(wallet, claimTypeId){
            let app = this;
            app.polling = true;
            return new Promise(function (resolve, reject) {
                (async function waitStatus(){
                    let res = await BridgeExtension.getBlockchainClaimPublishStatus(app.passportContext.passport, app.passportContext.passphrase, wallet, claimTypeId);
                    if(res && res.status != 2){
                        console.log("status non-pending, returning " + wallet.network);
                        return resolve(res);
                    }

                    if(app.polling){
                        console.log("status pending, waiting and retrying " + wallet.network);
                        setTimeout(waitStatus, 15000);
                    }   
                })();
            });
        },
        refreshPassportDetail: async function(){
            this.passportNeoLoading = true;
            this.passportEthLoading = true;
            
            await this.getPassportPublishStatus();

            this.passportNeoLoading = false;
            this.passportEthLoading = false;
        },
        getPassportPublishStatus: async function(){
            let pendingPassportPublish = await BridgeProtocol.Services.Passport.getPendingPassportPublishList(this.passportContext.passport, this.passportContext.passphrase);

            //See if the passport is published or pending publish on NEO
            if(this.neoWallet){
                let published = await BridgeProtocol.Services.Blockchain.getPassportForAddress(this.neoWallet.network, this.neoWallet.address);
                this.passportNeoPublished = false;
                if(published != null && published.length > 0)
                    this.passportNeoPublished = true;

                this.passportNeoPending = false;
                if(!this.passportNeoPublished){
                    for(let i=0; i<pendingPassportPublish.length; i++){
                        if(pendingPassportPublish[i].network.toLowerCase() === "neo")
                            this.passportNeoPending = true;
                    }
                }     
            }

            //See if the passport is published or pending publish on Ethereum
            if(this.ethWallet){
                let published = await BridgeProtocol.Services.Blockchain.getPassportForAddress(this.ethWallet.network, this.ethWallet.address);
                this.passportEthPublished = false;
                if(published != null && published.length > 0)
                    this.passportEthPublished = true;

                this.passportEthPending = false;
                if(!this.passportEthPublished){
                    for(let i=0; i<pendingPassportPublish.length; i++){
                        if(pendingPassportPublish[i].network.toLowerCase() === "eth")
                            this.passportEthPending = true;
                    }
                }
            }

             //If there is a pending publish, poll for status while open
            if(this.passportNeoPending || this.passportEthPending){
                console.log("passport publish pending, polling for updated status");
                this.polling = true;
                let app = this;
                window.setTimeout(async function(){
                    if(app.polling)
                        await app.getPassportPublishStatus();
                },15000);
            }
        },
        getDate(date){
            return BridgeExtension.getReadableDate(date);
        },
        navigateToMarketplace(){
            this.$emit('showMarketplace', true);
        },
        async showPublishDialog(){
            this.publishClaimDialog = false;
            this.publishDialog = true;
        },
        async showPublishClaimDialog(claim){
            this.lastSelectedClaim = "";
            this.publishClaim = claim;
            this.publishClaimDialog = true;
        },
        async passportPublished(){
            this.publishDialog = false;
            await this.refreshPassportDetail();
        },
        async claimPublished(publishedClaim){
            this.refreshClaim(this.publishClaim);
            this.publishClaim = null;
            this.publishClaimDialog = false;
        },
        async sendNeoClaimTransaction(claim){ 
            this.neoPublishing = true;
            try{
                await this.neoWallet.unlock(this.passportContext.passphrase);
                let claimPublishTransaction = await BridgeProtocol.Services.Blockchain.publishClaimTransaction(this.passportContext.passport, this.passportContext.passphrase, this.neoWallet, claim, claim.neoPublish.id, true);
                this.refreshClaim(claim);
            }
            catch(err){
                console.log(err);
                alert("Unable to publish claim: " + err.message);
            }
            this.neoPublishing = false;
        },
        openUrl: function(url){
            window.open(url);
        }
    },
    mounted: async function()
    {
        this.$nextTick(async function () {
            await this.init();
            await this.refreshClaims();
            this.mainContainerHeight = this.$refs.mainContainer.clientHeight;
        });
    }
};
</script>