<template>
<v-overlay :opacity=".5">
    <v-dialog v-model="visible" persistent fullscreen>
        <v-card fill-height>
            <v-card-title class="title">
                <v-row>
                    <v-col cols="auto"><v-img src="../images/bridge-token.png" width="36"></v-img></v-col>
                    <v-col cols="10">New Marketplace Request</v-col>
                </v-row>
            </v-card-title>
            <v-card-text>
                <v-progress-circular
                    indeterminate
                    color="secondary"
                    v-if="loading"
                ></v-progress-circular>
                <div v-if="!loading">
                    <p>
                        Choose a marketplace partner to send a request to verify your personal information and add claims to your digital identity.
                    </p>
                    <v-row>
                        <v-col class="d-flex" cols="12">
                            <v-select
                            :items="partners"
                            label="Marketplace Partner"
                            outlined
                            item-text="name"
                            item-value="id"
                            color="secondary"
                            @change="partnerSelected"
                            class="mb-0"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <div v-if="selectedPartner != null" class="mt-n10">
                        <v-row >
                            <v-col cols="3">
                                Name
                            </v-col>
                            <v-col cols="auto">
                                {{selectedPartner.name}}
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                Info Link
                            </v-col>
                            <v-col cols="auto">
                                <a @click="openUrl(selectedPartner.infoUrl)">{{selectedPartner.infoUrl}}</a>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                Network Fee
                            </v-col>
                            <v-col cols="auto">
                                {{networkFee}} BRDG
                            </v-col>
                        </v-row>
                        <v-alert
                            border="left"
                            colored-border
                            type="info"
                            elevation="0"
                            class="text-left mt-2 caption"
                            v-if="selectedPartner != null"
                            >
                            The Bridge Network fee is non-refundable and does not include additional fees for service that may be required by the selected Bridge Marketplace partner.  Some Bridge Marketplace partners are third party providers that have no affiliation with Bridge Protocol Corporation and may have independent terms, conditions, and fees for service.
                        </v-alert>
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="close()">Cancel</v-btn>
                <v-btn text @click="create()">Create Request</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</v-overlay>
</template>

<script>
export default {
    name: 'application-create-dialog',
    data: function () {
        return {
            visible: true,
            loading: false,
            selectedPartner: null,
            networkFee: 0,
            partners: []
        }
    },
    methods:{
        close: function(){
            this.$emit('close', true);
        },
        create: function(){
            this.$emit('created', true);
        },
        partnerSelected: async function(partnerId){
            if(!partnerId)
                return;

           this.selectedPartner = await BridgeProtocol.Services.Partner.getPartner(partnerId);
        },
        openUrl: function(url){
            this.$emit('openUrl', url);
        }
    },
    created: async function(){
        this.loading = true;
        let passportContext = await BridgeExtension.getPassportContext();
        this.partners = await BridgeProtocol.Services.Partner.getAllPartners();
        this.networkFee = await BridgeProtocol.Services.Bridge.getBridgeNetworkFee(passportContext.passport, passportContext.passphrase);
        this.loading = false;
    }
};
</script>