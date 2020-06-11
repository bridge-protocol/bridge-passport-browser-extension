<template>
    <v-container fill-height align-start text-center class="mx-0 my-0 px-0 py-0" ref="mainContainer">
        <v-container v-if="refreshing" fill-height align-middle class="mx-0 my-0 px-0 py-0">
            <v-progress-circular
                indeterminate
                color="secondary"
                style="margin-left: 50%;"
            ></v-progress-circular>
        </v-container>
        <v-container fill-height align-start px-0 py-0 mx-0 my-0 :style="'max-height:' + mainContainerHeight + 'px; overflow-y:auto;'">
            <v-btn
                absolute
                dark
                fab
                top 
                right
                color="accent"
                class="mt-8 mr-n3"
                @click="applicationCreateDialog = true"
                v-if="!refreshing" 
            >
                <v-icon link>mdi-plus</v-icon>
            </v-btn>
            <v-alert
                border="left"
                colored-border
                type="info"
                elevation="2"
                class="caption text-left pr-12"
                v-if="applications.length == 0 && !refreshing"
                >
                No Bridge Marketplace verification requests found.  Get started by creating a new marketplace request.
            </v-alert>
            <v-expansion-panels
                v-model="applicationPanels"
                >
                <v-expansion-panel
                v-for="(application,i) in applications"
                :key="i"
                @click="applicationSelected(application)"
                >
                    <v-expansion-panel-header class="left-border-color-primary pt-1 pb-1">
                        <v-row>
                            <v-col cols="auto"><v-img src="/images/bridge-token-white.png" height="40" width="40"></v-img></v-col>
                            <v-col cols="auto">
                                <div class="mb-1 title-2" v-text="application.partnerName"></div>
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
                                    <v-col cols="1" class="text-left">
                                        <v-progress-circular
                                            indeterminate
                                            color="secondary"
                                            size="12"
                                            width="2"
                                            v-if="application.pending"
                                        ></v-progress-circular>
                                    </v-col>
                                </v-row>
                                <v-row dense>
                                    <v-col cols="2" class="text-left">Partner</v-col>
                                    <v-col cols="auto">{{ application.partnerName }}</v-col>
                                </v-row>
                                <v-row dense v-if="application.status == 5">
                                    <v-col cols="2" class="text-left">Link</v-col>
                                    <v-col cols="10"  class="text-break text-left">
                                        <a @click="openUrl(application.url)">{{application.url}}</a>
                                    </v-col>
                                </v-row>
                                <v-subheader class="pl-0 ml-0 caption" v-if="application.transactionId">Network Fee Transaction</v-subheader>
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
        <application-create-dialog v-if="applicationCreateDialog" @close="applicationCreateDialog = false" @created="applicationCreated()" @openUrl="openUrl"></application-create-dialog>
        <v-dialog v-model="statusDialog" persistent max-width="600px">
            <v-card class="py-12">
                <v-container text-center align-middle>
                    <v-progress-circular
                        indeterminate
                        color="secondary"
                    ></v-progress-circular>
                    <v-container>{{loadStatus}}</v-container>
                </v-container>  
            </v-card>
        </v-dialog>
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
            applicationPanels: null,
            applicationLoading: false,
            lastSelectedApplication: null,
            statusDialog: false,
            loadStatus: "Please wait",
            polling: false
        }
    },
    methods: {
        applicationCreated(){
            this.applicationCreateDialog = false;
            this.refreshing = true;
            this.refreshApplications(0);
        },
        refreshApplications: async function(openIndex){
            this.refreshing = true;
            let passportContext = await BridgeExtension.getPassportContext();
            let applications = await BridgeProtocol.Services.Application.getApplicationList(passportContext.passport, passportContext.passphrase);
            for(let i=0; i<applications.length; i++){
                applications[i].index = i;
                let created = new Date(applications[i].createdOn * 1000); 
                applications[i].createdOn = created.toLocaleDateString() + " " + created.toLocaleTimeString();
                applications[i].src = "/images/bridge-token-white.png";
                applications[i].loading = false;
                let partner = await BridgeProtocol.Services.Partner.getPartner(applications[i].verificationPartner);
                if(partner)
                    applications[i].partnerName = partner.name; 
            }
            this.applications = applications;
            this.refreshing = false;
            if(openIndex != null){
                 let application = applications[openIndex];
                 this.lastSelectedApplication = application.id;
                 this.applicationPanels = [openIndex];
                 await this.refreshApplication(application);
            }
        },
        applicationSelected: async function(application){
            this.polling = false; //Reset any status polling
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
            
            await this.setApplicationDetail(application);

            this.applications.push({});
            this.applications.pop();
            application.loading = false;
        },
        setApplicationDetail: async function(application){
            let passportContext = await BridgeExtension.getPassportContext();
            let appDetails = await BridgeProtocol.Services.Application.getApplication(passportContext.passport, passportContext.passphrase, application.id);

            //Make the status readable
            application.status = appDetails.status;
            application.pending = application.status != 4 && application.status != 5;
            if(application.pending)
                application.statusText = "Awaiting Verification";
            else if(application.status == 5)
                application.statusText = "Sent Successfully";
            else if(application.status == 4)
                application.statusText = appDetails.statusMessage;

            application.url = appDetails.url;
            application.transactionId = appDetails.transactionId;

            if(appDetails.transactionFee){
                application.transactionFee = appDetails.transactionFee;
                //Legacy transaction amount format
                if(appDetails.transactionFee == 1000000000) 
                    application.transactionFee = 1;
            }

            if(appDetails.transactionNetwork)
                application.transactionNetwork = appDetails.transactionNetwork.toLowerCase();

            if(application.transactionNetwork === "neo"){
                application.transactionUrl = BridgeProtocol.Constants.neoscanUrl + "transaction/" + appDetails.transactionId;
            }
            else if(application.transactionNetwork === "eth"){
                application.transactionUrl = BridgeProtocol.Constants.etherscanUrl + "/tx/" + appDetails.transactionId;
            }

            //HACK: Make sure we refresh
            this.applications.push({});
            this.applications.pop();

            if(application.pending){
                let app = await this.waitApplicationComplete(application.id);
                this.setApplicationDetail(app);
            }
        },
        async waitApplicationComplete(applicationId){
            return new Promise(function (resolve, reject) {
                (async function waitForComplete(){
                    let passportContext = await BridgeExtension.getPassportContext();
                    let app = await BridgeProtocol.Services.Application.getApplication(passportContext.passport, passportContext.passphrase, applicationId);
                    if(app.status == 4 || app.status == 5){ //Failed or complete
                        console.log("Application verification complete");
                        return resolve(app);
                    }
                    console.log("Application verification not complete. Waiting and retrying.");
                    setTimeout(waitForComplete, 15000);
                })();
            });
        },
        openUrl: function(url){
            this.$emit('openUrl', url);
        }
    },
    created: async function(){
        await this.refreshApplications(null);
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