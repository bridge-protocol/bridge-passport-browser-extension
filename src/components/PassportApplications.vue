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
                    @click="applicationSelected(app)"
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
                            <v-container class="text-center" v-if="app.loading">
                                <v-progress-circular
                                    indeterminate
                                    color="secondary"
                                ></v-progress-circular>
                            </v-container>
                            <v-container v-if="!app.loading">
                                <v-subheader class="pl-0 ml-0 caption">Request Information</v-subheader>
                                <v-divider class="mb-2"></v-divider>
                                <v-row dense>
                                    <v-col cols="2" class="text-left">Status</v-col>
                                    <v-col cols="auto">{{ app.status }}</v-col>
                                    <v-col cols="auto">
                                        <v-btn v-if="app.status == 'waitingForNetworkFeePayment'" @click="resendPayment()" x-small color="secondary" :loading="retry">Send Payment</v-btn>
                                        <v-btn v-if="app.status == 'paymentRecieved' || app.status == 'notTransmittedToPartner'" @click="resendToPartner()" x-small color="secondary" :loading="retry">Retry Send</v-btn>
                                    </v-col>
                                </v-row>
                                <v-row dense>
                                    <v-col cols="2" class="text-left">Partner</v-col>
                                    <v-col cols="auto">{{ app.partnerName }}</v-col>
                                </v-row>
                                <v-row dense v-if="app.status == 'receivedByPartner'">
                                    <v-col cols="2" class="text-left">Link</v-col>
                                    <v-col cols="10"  class="text-break text-left">
                                        <a @click="openUrl(app.url)">{{app.url}}</a>
                                    </v-col>
                                </v-row>
                                <v-subheader class="pl-0 ml-0 caption" v-if="app.transactionId">Payment Transaction</v-subheader>
                                <v-divider class="mb-2" v-if="app.transactionId"></v-divider>
                                <v-row dense v-if="app.transactionId">
                                    <v-col cols="2" class="text-left"><v-img src="/images/bridge-token.png" height="20" width="20"></v-img></v-col>
                                    <v-col cols="auto">{{app.transactionFee}} BRDG</v-col>
                                </v-row>
                                <v-row dense v-if="app.transactionId">
                                    <v-col cols="2" class="text-left"><v-img :src="'/images/' + app.transactionNetwork + '-logo.png'" height="20" width="20"></v-img></v-col>
                                    <v-col cols="10" class="text-break text-left caption"><a @click="openUrl(app.transactionUrl)">{{app.transactionUrl}}</a></v-col>
                                </v-row>
                            </v-container>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-container>
        </v-container>
        <application-create-dialog v-if="applicationCreateDialog" @close="applicationCreateDialog = false" @created="init" @openUrl="openUrl"></application-create-dialog>
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
            refreshing: true,
            mainContainerHeight: 690,
            applicationCreateDialog: false,
            applications: [],
            applicationLoading: false,
            lastSelectedApplication: null,
            retry: false
        }
    },
    methods: {
        init: async function(){
            this.applicationCreateDialog = false;
            this.refreshing = true;

            let passportContext = await BridgeExtension.getPassportContext();
            let applications = await BridgeProtocol.Services.Application.getActiveApplications(passportContext.passport, passportContext.passphrase);
            for(let i=0; i<applications.length; i++){
                let created = new Date(applications[i].createdOn * 1000); 
                applications[i].createdOn = created.toLocaleDateString() + " " + created.toLocaleTimeString();
                applications[i].src = "/images/bridge-token-white.png";
                applications[i].partnerName = applications[i].partner;
                let partner = await BridgeProtocol.Services.Partner.getPartner(applications[i].verificationPartner);
                if(partner)
                    applications[i].partnerName = partner.name; 
            }
            this.applications = applications;

            this.refreshing = false;
        },
        applicationSelected: async function(application){
            if(this.lastSelectedApplication == application.id){
                this.lastSelectedApplication = "";
            }
            else{
                this.lastSelectedApplication = application.id;
                await this.refreshApplication(application);
            }
        },
        refreshApplication: async function(application){
            application.loading = true;

            //Update the application status from the service
            let passportContext = await BridgeExtension.getPassportContext();
            application = await BridgeProtocol.Services.Application.getApplication(passportContext.passport, passportContext.passphrase, application.id);

            //Make the status readable
            application.statusText = makeStringReadable(application.status);
            
            //Legacy transaction amount format
            if(application.transactionFee = 1000000000) 
                application.transactionFee = 1;
            
            if(application.transactionNetwork)
                application.transactionNetwork = application.transactionNetwork.toLowerCase();

            if(application.transactionNetwork === "neo"){
                application.transactionUrl = BridgeProtocol.Constants.neoscanUrl + "transaction/" + application.transactionId;
            }
            else if(application.transactionNetwork === "eth"){
                application.transactionUrl = BridgeProtocol.Constants.etherscanUrl + "/tx/" + application.transactionId;
            }

            this.applications.push({});
            this.applications.pop();

            application.loading = false;
        },
        resendPayment: async function(){

        },
        resendToParner: async function(){

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