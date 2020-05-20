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
                                <v-row dense v-if="application.status == 'complete'">
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
        <application-create-dialog v-if="applicationCreateDialog" @close="applicationCreateDialog = false" @created="refreshApplications(0)" @openUrl="openUrl"></application-create-dialog>
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
            retry: false,
            polling: false
        }
    },
    methods: {
        refreshApplications: async function(openIndex){
            this.applicationCreateDialog = false;
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
            if(appDetails.status == "complete")
                appDetails.status = "Sent Successfully";
            application.statusText = makeStringReadable(appDetails.status);
            application.pending = application.status != "failed" && application.status != "complete";
            application.url = appDetails.url;
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
            else if(application.transactionNetwork === "eth"){
                application.transactionUrl = BridgeProtocol.Constants.etherscanUrl + "/tx/" + appDetails.transactionId;
            }

            //If we are incomplete, set to poll every 15s
            if(application.pending){
                console.log("application pending, polling for updated status");
                this.polling = true;
                let app = this;
                window.setTimeout(async function(){
                    if(app.polling)
                        await app.setApplicationDetail(application);
                },15000);
            } 
        },
        resendPaymentAndSend: async function(application){
            this.statusDialog = true;
            let passportContext = await BridgeExtension.getPassportContext();
            let networkFee = await BridgeProtocol.Services.Bridge.getBridgeNetworkFee(passportContext.passport, passportContext.passphrase);

            //Send a blockchain fee payment
            this.loadStatus = "Sending network fee transaction";
            console.log("Sending network fee for " + application.id);
            let wallet = passportContext.passport.getWalletForNetwork("neo");
            await wallet.unlock(passportContext.passphrase);

            let recipient = BridgeProtocol.Constants.bridgeAddress;
            //Get the transaction id and send to the server and don't wait
            let transactionId = await BridgeProtocol.Services.Blockchain.sendPayment(wallet, networkFee, recipient, application.id, false);

            //Send the fee payment info back to the application API
            await BridgeProtocol.Services.Application.updatePaymentTransaction(passportContext.passport, passportContext.passphrase, application.id, transactionId);
            console.log("Request fee transaction updated: " + JSON.stringify(application));

            this.loadStatus = "Verifying network fee transaction";
            //Wait for the transaction to be done
            let status = await BridgeExtension.waitVerifyPayment(wallet.network, transactionId, wallet.address, recipient, networkFee, application.id);
            console.log("Network fee transaction: " + JSON.stringify(status));

            if(status)
            {
                //Relay to the partner
                this.loadStatus = "Relaying request to partner";
                await BridgeProtocol.Services.Application.retrySend(passportContext.passport, passportContext.passphrase, application.id);
            }
            else{
                alert("Payment verification failed");
                this.statusDialog = false;
            }

            this.refreshApplication(application);
            this.statusDialog = false;
        },
        resendPartner: async function(application){
            this.retry = true;
            let passportContext = await BridgeExtension.getPassportContext();
            await BridgeProtocol.Services.Application.retrySend(passportContext.passport, passportContext.passphrase, application.id);
            this.refreshApplication(application);
            this.retry = false;
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