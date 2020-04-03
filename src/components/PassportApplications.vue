<template>
    <v-container fill-height align-start text-center class="mx-0 my-0 px-0 py-0" ref="mainContainer">
        <v-container v-if="refreshing" class="mx-0 my-0 px-0 py-0">
            <v-progress-circular
                indeterminate
                color="secondary"
            ></v-progress-circular>
        </v-container>
        <v-container fill-height align-start px-0 py-0 mx-0 my-0 :style="'max-height:' + mainContainerHeight + 'px; overflow-y:auto;'">
            <v-expansion-panels>
                <v-expansion-panel
                v-for="(application,i) in applications"
                :key="i"
                @click="applicationSelected(application)"
                >
                    <v-expansion-panel-header class="left-border-color-primary pt-1 pb-1">
                        <v-row>
                            <v-col cols="auto"><v-img src="/images/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="auto">
                                <div class="mb-1 title-2" v-text="application.verificationPartner"></div>
                                <div class="caption" v-text="application.createdOn"></div>
                            </v-col>
                        <v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="left-border-color-primary">
                            <div class="text-center" v-if="application.loading">
                                <v-progress-circular
                                    indeterminate
                                    color="secondary"
                                ></v-progress-circular>
                            </div>
                            <v-container v-if="!application.loading">
                                <v-subheader class="pl-0 ml-0 caption">Request Information</v-subheader>
                                <v-divider class="mb-2"></v-divider>
                                <v-row dense>
                                    <v-col cols="2" class="text-left">Status</v-col>
                                    <v-col cols="auto">{{ application.statusText }}</v-col>
                                    <v-btn v-if="application.status == 'waitingForNetworkFeePayment'" @click="resendPayment()" x-small color="secondary" :loading="retry" class="ml-3">Send Payment</v-btn>
                                    <v-btn v-if="application.status == 'networkFeePaymentReceived' || application.status == 'notTransmittedToPartner'" @click="resendToPartner()" x-small color="secondary" :loading="retry" class="ml-3">Retry Send</v-btn>
                                </v-row>
                                <v-row dense>
                                    <v-col cols="2" class="text-left">Partner</v-col>
                                    <v-col cols="auto">{{ application.partnerName }}</v-col>
                                </v-row>
                                <v-row dense v-if="application.statusText == 'sentSuccessfully'">
                                    <v-col cols="2" class="text-left">Link</v-col>
                                    <v-col cols="10"  class="text-break text-left">
                                        <a @click="openUrl(application.url)">{{application.url}}</a>
                                    </v-col>
                                </v-row>
                                <v-subheader class="pl-0 ml-0 caption" v-if="application.transactionId">Payment Transaction</v-subheader>
                                <v-divider class="mb-2" v-if="application.transactionId"></v-divider>
                                <v-row dense v-if="application.transactionId">
                                    <v-col cols="2" class="text-left"><v-img src="/images/bridge-token.png" height="20" width="20"></v-img></v-col>
                                    <v-col cols="auto">{{application.transactionFee}} BRDG</v-col>
                                </v-row>
                                <v-row dense v-if="application.transactionId">
                                    <v-col cols="2" class="text-left"><v-img :src="'/images/' + application.transactionNetwork + '-logo.png'" height="20" width="20"></v-img></v-col>
                                    <v-col cols="10" class="text-break text-left caption"><a @click="openUrl(application.transactionUrl)">{{application.transactionUrl}}</a></v-col>
                                </v-row>
                            </v-container>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-container>
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
            this.refreshing = true;
            let passportContext = await BridgeExtension.getPassportContext();
            let applications = await BridgeProtocol.Services.Application.getActiveApplications(passportContext.passport, passportContext.passphrase);
            for(let i=0; i<applications.length; i++){
                let created = new Date(applications[i].createdOn * 1000); 
                applications[i].createdOn = created.toLocaleDateString() + " " + created.toLocaleTimeString();
                applications[i].src = "/images/bridge-token-white.png";
                applications[i].partnerName = applications[i].partner;
                applications[i].loading = false;
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
            //Update the application status from the service
            application.loading = true;
            let passportContext = await BridgeExtension.getPassportContext();
            let appDetails = await BridgeProtocol.Services.Application.getApplication(passportContext.passport, passportContext.passphrase, application.id);

            //application = appDetails;

            //Make the status readable
            application.status = appDetails.status;
            application.statusText = makeStringReadable(appDetails.status);

            console.log(JSON.stringify(appDetails));
            application.transactionId = appDetails.transactionId;

            if(appDetails.transactionFee){
                application.transactionFee = appDetails.transactionFee;
                //Legacy transaction amount format
                if(appDetails.transactionFee = 1000000000) 
                    application.transactionFee = 1;
            }

            if(appDetails.transactionNetwork)
                application.transactionNetwork = appDetails.transactionNetwork.toLowerCase();

            if(application.transactionNetwork === "neo"){
                application.transactionUrl = BridgeProtocol.Constants.neoscanUrl + "transaction/" + appDetails.transactionId;
            }
            else if(appDetails.transactionNetwork === "eth"){
                application.transactionUrl = BridgeProtocol.Constants.etherscanUrl + "/tx/" + appDetails.transactionId;
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