<template>
    <v-container fill-height align-start text-center class="mx-0 my-0 px-0 py-0" ref="mainContainer">
        <v-container v-if="refreshing" class="mx-0 my-0 px-0 py-0">
            <v-progress-circular
                indeterminate
                color="secondary"
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
                    class="text-left mt-2"
                    v-if="claims.length == 0"
                    >
                    No digital identity verified claims found.  To add verified claims, find a verification partner on the Bridge Marketplace.
                </v-alert>
                <v-expansion-panel
                v-for="(claim,i) in claims"
                :key="i"
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
                        <div v-if="claim.loaded">
                            <v-subheader class="pl-0 ml-0 caption">Claim Details</v-subheader>
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
                                    <v-col cols="auto" class="text-left">
                                        <v-img :src="'/images/neo-logo.png'" height="20" contain></v-img>
                                    </v-col>
                                    <v-col cols="auto" v-if="!claim.loading">
                                        <v-row v-if="claim.neoClaim" class="mt-n3">
                                            <v-col cols="auto">Date</v-col>
                                            <v-col cols="auto">{{getDate(claim.neoClaim.date)}}</v-col>
                                            <v-col cols="auto" class="ml-2">Value</v-col>
                                            <v-col cols="auto">{{claim.neoClaim.value}}</v-col>
                                            <v-col cols="auto"><v-btn @click="unpublishClaim(claim.claimTypeId, 'neo')" x-small color="secondary" class="ml-2" :loading="neoWait">Unpublish</v-btn></v-col>
                                        </v-row>
                                        <span cols="auto" v-if="!claim.neoClaim">
                                            Not Published
                                            <v-btn @click="publishClaim(claim, 'neo')" x-small color="secondary" class="ml-2" :loading="neoWait">Publish</v-btn>
                                        </span>
                                    </v-col>
                                    <v-col cols="auto" v-if="claim.loading">
                                        <v-progress-circular
                                            indeterminate
                                            color="secondary"
                                            size="16"
                                            width="2"
                                        ></v-progress-circular>
                                    </v-col>
                                </v-row>
                                <v-row dense v-if="ethWallet != null">
                                    <v-col cols="auto" class="text-left">
                                        <v-img :src="'/images/eth-logo.png'" height="20" contain></v-img>
                                    </v-col>
                                    <v-col cols="auto" v-if="!claim.loading">
                                        <span v-if="claim.ethClaim">
                                           <v-row v-if="claim.neoClaim" class="mt-n3">
                                                <v-col cols="auto">Date</v-col>
                                                <v-col cols="auto">{{getDate(claim.neoClaim.date)}}</v-col>
                                                <v-col cols="auto" class="ml-2">Value</v-col>
                                                <v-col cols="auto">{{claim.neoClaim.value}}</v-col>
                                                <v-col cols="auto"><v-btn @click="unpublishClaim(claim.claimTypeId, 'eth')" x-small color="secondary" class="ml-2" :loading="ethWait">Unpublish</v-btn></v-col>
                                            </v-row>
                                        </span>
                                        <span cols="auto" v-if="!claim.ethClaim">
                                            Not Published
                                            <v-btn @click="publishClaim(claim,'eth')" x-small color="secondary" class="ml-2" :loading="ethWait">Publish</v-btn>
                                        </span>
                                    </v-col>
                                    <v-col cols="auto" v-if="claim.loading || ethLoading">
                                        <v-progress-circular
                                            indeterminate
                                            color="secondary"
                                            size="16"
                                            width="2"
                                        ></v-progress-circular>
                                    </v-col>
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
                claim.loaded = true;
                this.refreshClaim(claim);
            }
        },
        refreshClaim: async function(claim){
            claim.loading = true;

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.claims.push({});
            this.claims.pop();

            let passportContext = await BridgeExtension.getPassportContext();
            try
            {
                if(this.neoWallet){
                    let neoWallet = passportContext.passport.getWalletForNetwork("neo");
                    claim.neoClaim = await BridgeProtocol.Services.Blockchain.getClaim(this.neoWallet.network, claim.claimTypeId, this.neoWallet.address);
                }
                if(this.ethWallet){
                    let ethWallet = passportContext.passport.getWalletForNetwork("eth");
                    claim.ethClaim = await BridgeProtocol.Services.Blockchain.getClaim(this.ethWallet.network, claim.claimTypeId, this.ethWallet.address);
                }  
            }
            catch(err){
                alert(err.message);
            }

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.claims.push({});
            this.claims.pop();

            claim.loading = false;
        },
        refreshClaims: async function(){
            this.refreshing = true;

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
            this.refreshing = false;
        },
        async publishClaim(claim, network){
            if(network.toLowerCase() === "neo")
                this.neoWait = true;
            else if(network.toLowerCase() === "eth")
                this.ethWait = true;

            let passportContext = await BridgeExtension.getPassportContext();
            let wallet = passportContext.passport.getWalletForNetwork(network);
            await wallet.unlock(passportContext.passphrase);

            try{
                //Check and see if it's published
                console.log("Verifying passport is published");
                let publish = await BridgeProtocol.Services.Blockchain.getPassportForAddress(wallet.network, wallet.address);
                //Make sure the passport is published / registered
                if(!publish)
                {
                    console.log("Passport not published, publishing");
                    await BridgeProtocol.Services.Blockchain.publishPassport(wallet, passportContext.passport);
                    publish = await BridgeProtocol.Services.Blockchain.getPassportForAddress(wallet.network, wallet.address);
                    if(!publish)
                    {
                        alert("Could not publish passport.");
                        return;
                    }
                }

                console.log("Publishing claim");
                await BridgeProtocol.Services.Blockchain.addClaim(passportContext.passport, passportContext.passphrase, wallet, claim, false);
                let res = await BridgeProtocol.Services.Blockchain.getClaim(wallet.network, wallet.address, claim.claimTypeId.toString());
                this.refreshClaims();
            }
            catch(err){
                console.log("Unable to publish claim: " + err);
            }

            this.neoWait = false;
            this.ethWait = false;
        },
        getDate(date){
            date = new Date(date * 1000); 
            return date.toLocaleDateString();
        },
        async unpublishClaim(claimTypeId, network){
            if(network.toLowerCase() === "neo")
                this.neoWait = true;
            else if(network.toLowerCase() === "eth")
                this.ethWait = true;

            let passportContext = await BridgeExtension.getPassportContext();
            let wallet = passportContext.passport.getWalletForNetwork(network);
            await wallet.unlock(passportContext.passphrase);
            await BridgeProtocol.Services.Blockchain.removeClaim(wallet, claimTypeId);
            this.refreshClaims();

            this.neoWait = false;
            this.ethWait = false;
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
            claims: []
        }
    },
    created: async function(){
        await this.init();
        await this.refreshClaims();
        this.mainContainerHeight = this.$refs.mainContainer.clientHeight;
    }
};
</script>