<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      class="gradient3"
    >
      <v-list dense>
        <v-list-item link @click="drawer = !drawer, currentView = 'passportHome'">
            <v-img src="../../images/bridge-white.png" contain height="46" aspect="1" position="left" class="ml-0 mt-1 mb-3" @click.stop="drawer = !drawer, currentView = 'passportHome'"></v-img>
        </v-list-item>
        <v-divider class="mb-2"></v-divider>
        <v-list-item :disabled="!passportLoaded" :class="isCurrentView('passportDetails') ? 'gradient2':''" link @click="drawer = !drawer, currentView = 'passportDetails'">
          <v-list-item-action>
            <v-icon>mdi-fingerprint</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title >My Digital Identity</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link :disabled="!passportLoaded" :class="isCurrentView('passportWallets') ? 'gradient2':''" @click="drawer = !drawer, currentView = 'passportWallets'">
          <v-list-item-action>
            <v-icon>mdi-wallet</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>My Blockchain Wallets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :disabled="!passportLoaded" :class="isCurrentView('passportNfts') ? 'gradient2':''" link @click="drawer = !drawer, currentView = 'passportNfts'">
          <v-list-item-action>
            <v-icon>mdi-image-multiple</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title >My Non-Fungible Tokens</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link :disabled="!passportLoaded" :class="isCurrentView('passportApplications') ? 'gradient2':''" @click="drawer = !drawer, currentView = 'passportApplications'">
          <v-list-item-action>
            <v-icon>mdi-shopping</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>My Marketplace Requests</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link @click="openUrl('https://explorer.bridgeprotocol.io/')">
          <v-list-item-action>
            <v-icon>mdi-compass</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Network Explorer</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
      color="gradient2"
    >
      <v-toolbar-title>
        <v-row link>
          <v-col cols="auto">
            <v-icon @click.stop="drawer = !drawer" link class="mt-n1 mr-2">mdi-menu</v-icon>
            <span v-if="isCurrentView('passportDetails')">Digital Identity</span>
            <span v-if="isCurrentView('passportWallets')">Blockchain Wallets</span>
            <span v-if="isCurrentView('passportApplications')">Marketplace Requests</span>
            <span v-if="isCurrentView('passportNfts')">Non-Fungible Tokens</span>
          </v-col>
        </v-row>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-menu close-on-click offset-y small>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-icon small>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <v-subheader inset>Passport Options</v-subheader>
          <v-divider inset></v-divider>

          <v-list-item two-line :disabled="!passportLoaded" @click="exportPassport()">
            <v-list-item-icon>
              <v-icon>mdi-download</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Export Passport</v-list-item-title>
              <v-list-item-subtitle>
                Backup your passport to a file on your local disk
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
         <v-list-item two-line :disabled="!passportLoaded" @click="closePassport()">
            <v-list-item-icon>
              <v-icon>mdi-lock</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Lock Passport</v-list-item-title>
              <v-list-item-subtitle>
                Clear your passphrase but keep the passport json cached for future use
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line :disabled="!passportLoaded" @click="removePassport()">
            <v-list-item-icon>
              <v-icon>mdi-close</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Unload Passport</v-list-item-title>
              <v-list-item-subtitle>
                Clear your passphrase and clear the cached the passport json
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line :disabled="!passportLoaded" @click="handoffDialog = true">
            <v-list-item-icon>
              <v-icon>mdi-cellphone-arrow-down</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Send to Mobile</v-list-item-title>
              <v-list-item-subtitle>
                Sync with your Bridge Mobile Passport
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-divider inset></v-divider>
          
          <v-list-item @click="aboutDialog = true">
            <v-list-item-icon>
              <v-icon>mdi-information</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>About Bridge Passport</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content>
      <v-container
        fill-height 
        justify-center 
        text-center
        ma-0
        pa-0
      >

      <!-- about dialog -->
      <about-dialog v-if="aboutDialog" @close="aboutDialog = false" @openUrl="openUrl"></about-dialog>

      <!-- handoff dialog -->
      <handoff-dialog v-if="handoffDialog" @close="handoffDialog = false"></handoff-dialog>

      <!-- open dialog -->
      <open-dialog v-if="openDialog" @unlocked="unlocked()"></open-dialog>

      <!-- unlock dialog -->
      <unlock-dialog v-if="unlockDialog" @unlocked="unlocked()" @unload="removePassport()"></unlock-dialog>

      <!-- login dialog -->
      <login-dialog v-if="loginDialog" :sender="sender" :request="request" @login="login" @cancel="loginDialog = false"></login-dialog>
      
      <!-- Payment dialog -->
      <payment-dialog v-if="paymentDialog" :sender="sender" :request="request" @cancel="paymentDialog = false" @paymentSent="paymentSent" @openUrl="openUrl"></payment-dialog>

      <!-- claims import dialog -->
      <claims-import-dialog v-if="claimsImportDialog" :sender="sender" :request="request" @cancel="claimsImportDialog = false" @imported="claimsImported"></claims-import-dialog>

      <!-- content -->
      <passport-details v-if="isCurrentView('passportDetails')" @showMarketplace="currentView = 'passportApplications'"></passport-details>
      <passport-wallets v-if="isCurrentView('passportWallets')" @openUrl="openUrl"></passport-wallets>
      <passport-applications v-if="isCurrentView('passportApplications')" @openUrl="openUrl"></passport-applications>
      <passport-nfts v-if="isCurrentView('passportNfts')"></passport-nfts>

      <!-- home view -->
      <v-container v-if="isCurrentView('passportHome')" class="text-center" style="position:fixed; top:250px;">
        <v-row><v-col cols="12" class="text-center"><v-img src="../../images/bridge-passport.png" height="250" contain></v-img></v-col></v-row>
        <v-row>
          <v-col cols="3"></v-col>
          <v-col cols="6" class="text-center"><v-divider class="my-0"></v-divider></v-col>
          <v-col cols="3"></v-col>
        </v-row>
        <v-row><v-col cols="12" class="text-center"><div class="text-uppercase">{{passportId}}</div></v-col></v-row>
      </v-container>

      </v-container>
    </v-content>

    <v-footer app class="d-flex flex-row justify-space-between gradient">
      <div>
        &copy; {{ currentYear }} Bridge Protocol Corporation
      </div>
      <div>
      </div>
      <div>
        Bridge Passport v{{ passportVersion }}
      </div>
    </v-footer>
  </v-app>
</template>

<style>

html, body{
    padding: 0px;
    margin: 0px;
    overflow-y: hidden;
}

.gradient{
    background: rgb(144,64,153) !important;
    background: -moz-linear-gradient(343deg, rgba(144,64,153,1) 0%, rgba(97,85,163,1) 62%, rgba(52,139,201,1) 100%) !important;
    background: -webkit-linear-gradient(343deg, rgba(144,64,153,1) 0%, rgba(97,85,163,1) 62%, rgba(52,139,201,1) 100%) !important;
    background: linear-gradient(343deg, rgba(144,64,153,1) 0%, rgba(97,85,163,1) 62%, rgba(52,139,201,1) 100%) !important;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#904099",endColorstr="#348bc9",GradientType=1) !important;
}

.gradient2{
    background:#6451ab !important;
    background: -moz-linear-gradient(343deg, rgba(97,85,163,1) 62%, rgba(52,139,201,1) 100%) !important;
    background: -webkit-linear-gradient(343deg,rgba(97,85,163,1) 62%, rgba(52,139,201,1) 100%) !important;
    background: linear-gradient(343deg, rgba(97,85,163,1) 62%, rgba(52,139,201,1) 100%) !important;
}

.gradient3{
    background: rgb(27,28,29) !important;
    background: -moz-linear-gradient(90deg,rgba(54,56,57,1) 10%, rgba(27,28,29,1) 100%) !important;
    background: -webkit-linear-gradient(90deg, rgba(54,56,57,1) 10%, rgba(27,28,29,1) 100%) !important;
    background: linear-gradient(90deg,rgba(54,56,57,1) 10%, rgba(27,28,29,1) 100%) !important;

}

.left-border-color-primary{
    border-left:0px solid rgba(97,85,163,1);
}
</style>

<script>
  import AboutDialog from '../components/AboutDialog.vue';
  import OpenDialog from '../components/OpenDialog.vue';
  import UnlockDialog from '../components/UnlockDialog.vue';
  import HandoffDialog from '../components/HandoffDialog.vue';
  import LoginDialog from '../components/LoginDialog.vue';
  import PaymentDialog from '../components/PaymentDialog.vue';
  import ClaimsImportDialog from '../components/ClaimsImportDialog.vue';
  import PassportDetails from '../components/PassportDetails.vue';
  import PassportWallets from '../components/PassportWallets.vue';
  import PassportApplications from '../components/PassportApplications.vue';
  import PassportNfts from '../components/PassportNfts.vue';

  export default {
    components: {
      AboutDialog,
      OpenDialog,
      UnlockDialog,
      HandoffDialog,
      LoginDialog,
      PaymentDialog,
      ClaimsImportDialog,
      PassportDetails,
      PassportWallets,
      PassportApplications,
      PassportNfts
    },
    props: {
      source: String,
    },
    data: () => ({
      passportId: "",
      passportLoaded: false,
      openDialog: false,
      unlockDialog: false,
      aboutDialog: false,
      handoffDialog: false,
      loginDialog: false,
      paymentDialog: false,
      claimsImportDialog: false,
      externalParams: null,
      externalRequest: null,
      sender: null,
      request: null,
      drawer: null,
      currentYear: new Date().getFullYear(),
      passportVersion: BridgeExtension.version,
      currentView: ""
    }),
    methods: {
      isCurrentView: function(name){
        return this.currentView === name;
      },
      openUrl: function(url){
        BridgeExtension.openPage(url);
      },
      unlocked: async function(){
        if(this.externalParams != null){
          this.externalRequest = BridgeExtension.getParamRequest(this.externalParams);
          this.externalParams = null;
        }
        this.openPassport();
      },
      openPassport: async function(){
        this.unlockDialog = false;
        this.openDialog = false;
        this.currentView = "passportHome";
        let passportContext = await BridgeExtension.getPassportContext();
        this.passportLoaded = true;
        this.passportId = passportContext.passport.id;

        //If we were invoked by an external request, route to handle it
        if(this.externalRequest != null){
          await this.routeExternalRequest(this.externalRequest);
          this.externalRequest = null;
        }
      },
      routeExternalRequest: async function(request){
          this.loginDialog = false;
          this.paymentDialog = false;
          this.claimsImportDialog = false;

          if (request.action === "login") {
              this.sender = request.sender;
              this.request = request.loginRequest;
              this.loginDialog = true;
          }
          else if (request.action === "payment") {
              this.sender = request.sender;
              this.request = request.paymentRequest;
              this.paymentDialog = true;
          }
          else if (request.action === "claimsImport") {
              this.sender = request.sender;
              this.request = request.claimsImportRequest;
              this.claimsImportDialog = true;
          }
      },
      closePassport: async function(){
          this.currentView = "";
          this.passportId = "";
          await BridgeExtension.closePassport();
          //Reload to clear any cached external directives
          BridgeExtension.loadPage("main", null, true);
      },
      removePassport: async function(){
          this.currentView = "";
          this.passportId = "";
          await BridgeExtension.removePassport();
          //Reload to clear any cached external directives
          BridgeExtension.loadPage("main", null, true);
      },
      exportPassport: async function(){
          let passportContext = await BridgeExtension.getPassportContext();
          await BridgeExtension.exportPassport(passportContext.passport);
      },
      checkPassportStatus: async function(){
          //Force focus any time we engage the passport
          window.focus();

          let passportContext = await BridgeExtension.getPassportContext();

          //Check to see if we're loaded, unlocked, etc
          if(!passportContext.passport && !passportContext.passphrase){
            this.openDialog = true;
          }
          else if(!passportContext.passphrase && passportContext.passport){
            this.unlockDialog = true;
          }
          else if(passportContext.passport && passportContext.passphrase){
            this.openPassport();
          }
      },
      login: async function(res){
        await BridgeExtension.sendLoginResponse(res.sender, res.response);
        this.sender = null;
        this.request = null;
        this.loginDialog = false;
        this.currentView = "passportHome";
      },
      claimsImported: async function(){
        this.sender = null;
        this.request = null;
        this.claimsImportDialog = false;
        this.currentView = "passportDetails";
      },
      paymentSent: async function(res){
        this.sender = null;
        this.request = null;
        this.paymentDialog = false;
        await BridgeExtension.sendPaymentResponse(res.sender, res.response);
        this.currentView = "passportHome";
      }
    },
    async created () {
      this.$vuetify.theme.dark = true;
      this.$vuetify.theme.primary = '#673ab7';
      init(this);
    }
  }

  async function init(app){
      window.app = this;
      window.focus();

      //If we got a request from the background page to handle an external request while we were loaded
      window.browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
          if (request.target != "popup")
              return;

          app.externalRequest = request;
          app.checkPassportStatus();
          sendResponse();
      });

      //If we were launched from an external request while closed we get the params from the route
      let params = BridgeExtension.getQueryStringFromLocation();
      if (params) {
          app.externalParams = params;
      }

      app.checkPassportStatus();
  }
</script>