<template>
    <v-container fill-height align-start class="mx-0 my-0 px-0 py-0">
        <v-container v-if="refreshing" class="mx-0 my-0 px-0 py-0">
            <v-progress-circular
                indeterminate
                color="secondary"
            ></v-progress-circular>
        </v-container>
        <v-container fill-height align-start text-left v-if="!refreshing" class="mt-0 my-0 px-0 py-0" ref="mainContainer">
            <v-btn
                absolute
                dark
                fab
                top 
                right
                color="accent"
                class="mt-8 mr-n3"
                @click="applicationCreateDialog = true"
            >
                <v-icon link @click="">mdi-plus</v-icon>
            </v-btn>
            <v-alert
                border="left"
                colored-border
                type="info"
                elevation="2"
                class="mt-2 text-left"
                v-if="applications.length == 0"
                >
                No Bridge Marketplace verification requests found.  Create a verification request to get started.
            </v-alert>
            <v-container fill-height align-start px-0 py-0 mx-0 my-0 :style="'max-height:' + mainContainerHeight + 'px; overflow-y:auto;'">
                <v-expansion-panels>
                    <v-expansion-panel
                    v-for="(app,i) in applications"
                    :key="app.id"
                    >
                        <v-expansion-panel-header class="left-border-color-primary">
                            <v-row>
                                <v-col cols="auto"><v-img :src="app.src" height="40" width="40"></v-img></v-col>
                                <v-col cols="auto">
                                    <div class="my-1 title-2" v-text="app.partnerName"></div>
                                    <div class="caption" v-text="app.createdOn"></div>
                                </v-col>
                            </v-row>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="left-border-color-primary">
                            <v-subheader class="pl-0 ml-0 caption">Request Information</v-subheader>
                            <v-divider class="mb-2"></v-divider>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Status</v-col>
                                <v-col cols="auto">{{ app.status }}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Partner</v-col>
                                <v-col cols="auto">{{ app.partnerName }}</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left">Link</v-col>
                                <v-col cols="10"  class="text-break text-left">
                                    <a @click="openUrl(app.url)">{{app.url}}</a>
                                </v-col>
                            </v-row>
                            <v-subheader class="pl-0 ml-0 caption">Payment Transaction</v-subheader>
                            <v-divider class="mb-2"></v-divider>
                            <v-row dense>
                                <v-col cols="2" class="text-left"><v-img src="/images/bridge-token.png" height="20" width="20"></v-img></v-col>
                                <v-col cols="auto">{{app.transactionFee}} BRDG</v-col>
                            </v-row>
                            <v-row dense>
                                <v-col cols="2" class="text-left"><v-img :src="'/images/' + app.transactionNetwork.toLowerCase() + '-logo.png'" height="20" width="20"></v-img></v-col>
                                <v-col cols="10" class="text-break text-left caption"><a @click="openUrl(app.transactionUrl)">{{app.transactionUrl}}</a></v-col>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-container>
        </v-container>
        <application-create-dialog v-if="applicationCreateDialog" @close="applicationCreateDialog = false" @created="init"></application-create-dialog>
    </v-container>
</template>

<script>
import ApplicationCreateDialog from './PassportApplicationsCreateDialog.vue';
export default {
    name: 'passport-applications',
    components: {
      ApplicationCreateDialog
    },
    data: function() {
        return {
            passportId: "",
            refreshing: true,
            mainContainerHeight: 600,
            applicationCreateDialog: false,
            applications: []
        }
    },
    methods: {
        init: async function(){
            this.applicationCreateDialog = false;
            this.refreshing = true;
            this.applications = [];

            let passportContext = await BridgeExtension.getPassportContext();
            if(passportContext.passport)
            {
                let applications = await BridgeProtocol.Services.Application.getActiveApplications(passportContext.passport, passportContext.passphrase);
                for(let i=0; i<applications.length; i++){
                    let created = new Date(applications[i].createdOn * 1000); 
                    applications[i].createdOn = created.toLocaleDateString() + " " + created.toLocaleTimeString();

                    //This will change as more partners get added
                    applications[i].src = "/images/bridge-token-white.png";
                    applications[i].partnerName = applications[i].partner;

                    let partner = await BridgeProtocol.Services.Partner.getPartner(applications[i].verificationPartner);
                    if(partner)
                        applications[i].partnerName = partner.name; 

                    //Make the status readable
                    applications[i].status = makeStringReadable(applications[i].status);
                    
                    //Legacy transaction amount format
                    if(applications[i].transactionFee = 1000000000) 
                        applications[i].transactionFee = 1;

                    if(applications[i].transactionNetwork.toLowerCase() === "neo"){
                        applications[i].transactionUrl = BridgeProtocol.Constants.neoscanUrl + "transaction/" + applications[i].transactionId;
                    }
                    else if(applications[i].transactionNetwork.toLowerCase() === "eth"){
                        applications[i].transactionUrl = BridgeProtocol.Constants.etherscanUrl + "/tx/" + applications[i].transactionId;
                    }
                }

                this.applications = applications;
                this.refreshing = false;
            }
        },                
        openUrl: function(url){
            this.$emit('openUrl', url);
        }
    },
    created: async function(){
        await this.init();
        //Update the rendered height
        this.mainContainerHeight = this.$refs.mainContainer.clientHeight;
    }
};

function makeStringReadable(str) {
	let camelMatch = /([A-Z])/g;
	str = str.replace(camelMatch, " $1");

	//Make sure we're upper case
	str = str.charAt(0).toUpperCase() + str.slice(1);

	return str;
}
</script>