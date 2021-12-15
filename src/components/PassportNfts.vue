<template>
    <v-container fill-height align-start text-center class="mx-0 my-0 px-0 py-0" ref="mainContainer">
        <v-container v-if="refreshing" class="text-center" style="position:fixed; top:250px;">
            <v-row><v-col cols="12" class="text-center"><v-img :src="'/images/spinner.svg'" height="80" contain></v-img></v-col></v-row>
            <v-row><v-col cols="12" class="text-center"><div>{{loadStatus}}</div></v-col></v-row>
        </v-container>
        <v-container ref="nftContainer" v-if="!refreshing" fill-height align-start px-0 py-0 mx-0 my-0>
            <v-alert
                border="left"
                colored-border
                type="info"
                elevation="2"
                class="caption text-left mt-2"
                style="width:100%;"
                v-if="nfts.length == 0"
                >
                No NFTs found
            </v-alert>
            <v-expansion-panels v-if="nfts.length > 0">
                <v-expansion-panel
                v-for="(nft) in nfts"
                :key="nft.tokenAddress+nft.tokenId"
                >
                    <v-expansion-panel-header class="left-border-color-primary">
                        <v-row>
                            <v-col cols="auto"><v-img :src="getImage(nft)" height="40" width="40"></v-img></v-col>
                            <v-col cols="auto">
                                <div class="mb-1 title-2" v-text="nft.name"></div>
                                 <div class="caption">Ethereum</div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="left-border-color-primary">
                        <v-container fluid class="mt-n4">
                            <v-subheader class="pl-0 ml-0 caption">
                                NFT Details 
                            </v-subheader>
                            <v-divider class="mb-2"></v-divider>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Chain:</v-col>
                                <v-col cols="auto">Ethereum</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Contract:</v-col>
                                <v-col cols="auto">{{nft.tokenAddress}}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Token Id:</v-col>
                                <v-col cols="auto" style="width:400px; text-overflow:ellipsis;">{{nft.tokenId}}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Name:</v-col>
                                <v-col cols="auto">{{nft.name}}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Description:</v-col>
                                <v-col cols="auto" class="text-left pb-2">{{nft.description}}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="auto"><v-btn x-small color="accent" class="mt-4" @click="view(nft)">View Full Details</v-btn></v-col>
                            </v-row>
                        </v-container>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-container>
    </v-container>
</template>

<style scoped>
    .clip {
        text-overflow: ellipsis; 
        overflow: hidden; 
        white-space: nowrap;
        width:400px;
    }
</style>

<script>
export default {
    name: 'passport-nfts',
    components: {

    },
    data: function() {
        return {
            loadStatus: "Please Wait",
            mainContainerHeight: 650,
            lastSelected: "",
            ethWallet: null,
            refreshing: true,
            nfts: [],
            dialog: false
        }
    },
    methods: {
        init: async function(){
            this.refreshing = true;
            this.passportContext = await BridgeExtension.getPassportContext();
            this.wallet = this.passportContext.passport.getWalletForNetwork("eth");
            this.refresh();
        },
        refresh: async function(){
            this.refreshing = true;
            this.nfts = await BridgeProtocol.Services.Blockchain.getNftsForAddress(this.wallet.network, this.wallet.address);
            //cleanup any broken
            for(let i=0; i<this.nfts.length; i++)
            {
                if(!this.nfts[i].name)
                    this.nfts[i].name = "<Missing Name>";
            }
            this.refreshing = false;
        },
        view: function(nft){
            window.open(nft.openseaLink);
        },
        getImage(nft){
            let img = nft.imageUrlThumbnail ? nft.imageUrlThumbnail : nft.imagePreviewUrl;
            if(!img)
                img = "";

            return img;
        }
    },
    mounted: async function()
    {
        this.$nextTick(async function () {
            await this.init();
        });
    }
};
</script>