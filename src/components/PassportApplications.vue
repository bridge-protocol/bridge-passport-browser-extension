<template>
    <v-container fill-height align-start>
        <v-container class="mt-0 pt-0">
            <h3 inset><v-icon class="mr-2">mdi-shopping</v-icon> Bridge Marketplace Verification Requests</h3>
        </v-container>
        <v-container text-center v-if="!applicationsLoaded">
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
        </v-container>
        <v-container fill-height align-start v-if="applicationsLoaded">
            <v-row v-if="applications.length == 0">
                <v-col cols="auto" fill-height fill-width align-start text-center>
                    No verification requests found.
                </v-col>
            </v-row>
            <v-expansion-panels>
                    <v-expansion-panel
                    v-for="(app,i) in applications"
                    :key="app.id"
                    @click="appSelected(app)"
                    >
                        <v-expansion-panel-header class="mb-2" color="secondary">
                            <v-row>
                                <v-col cols="auto"><v-img :src="app.src" height="40" width="40"></v-img></v-col>
                                <v-col cols="auto">
                                    <h3 class="mb-2" v-text="app.createdOn"></h3>
                                    <div v-text="app.partnerName"></div>
                                </v-col>
                            <v-row>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-row>
                                <v-col cols="2">Status</v-col>
                                <v-col cols="auto">{{ app.status }}</v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="2">Link</v-col>
                                <v-col cols="10"  class="text-break">
                                    <a @click="openUrl(app.url)">{{app.url}}</a>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="2"><v-img src="/images/bridge-token.png" height="20" width="20"></v-img></v-col>
                                <v-col cols="auto">{{app.transactionFee}}</v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="2"><v-img :src="'/images/' + app.transactionNetwork.toLowerCase() + '-logo.png'" height="20" width="20"></v-img></v-col>
                                <v-col cols="10" class="text-break caption">{{app.transactionId}}</v-col>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
            </v-expansion-panels>
        </v-container>
    </v-container>

</template>

<script>
export default {
    name: 'passport-applications',
    data: function() {
        return {
            passportId: "",
            applicationsLoaded: false,
            applications: []
        }
    },
    methods: {
        init: async function(){
            this.applicationsLoaded = false;
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
                }

                this.applications = applications;
                this.applicationsLoaded = true;
            }
        },
        appSelected: function(app){
            
        },                  
        openUrl: function(url){
            this.$emit('openUrl', url);
        }
    },
    created: async function(){
        await this.init();
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