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
        <v-list-item link :disabled="!passportLoaded" :class="isCurrentView('passportApplications') ? 'gradient2':''" @click="drawer = !drawer, currentView = 'passportApplications'">
          <v-list-item-action>
            <v-icon>mdi-shopping</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>My Marketplace Requests</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item color="red" link @click="openUrl('https://bridgeprotocol.azurewebsites.net/')">
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
      color="gradient"
    >
      <v-toolbar-title>
        <v-row link>
          <v-col cols="auto" link ><v-icon @click.stop="drawer = !drawer" link>mdi-menu</v-icon></v-col>
          <v-col cols="auto" class="subtitle-1 mt-1">
            <span v-if="isCurrentView('passportDetails')">Digital Identity</span>
            <span v-if="isCurrentView('passportWallets')">Blockchain Wallets</span>
            <span v-if="isCurrentView('passportApplications')">Marketplace Requests</span>
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
        class="fill-height justify-center text-center"
        fluid
      >

      <!-- about dialog -->
      <about-dialog v-if="aboutDialog" @close="aboutDialog = false" @openUrl="openUrl"></about-dialog>

      <!-- open dialog -->
      <open-dialog v-if="openDialog" @unlocked="openPassport()"></open-dialog>

      <!-- unlock dialog -->
      <unlock-dialog v-if="unlockDialog" @unlocked="openPassport()"></unlock-dialog>

      <!-- login dialog -->
      <login-dialog v-if="loginDialog" :sender="sender" :request="request" @login="login"></login-dialog>
      
      <!-- Payment dialog -->
      <payment-dialog v-if="paymentDialog" :sender="sender" :request="request" @paymentSent="paymentSent"></payment-dialog>

      <!-- claims import dialog -->
      <claims-import-dialog v-if="claimsImportDialog" :sender="sender" :request="request" @close="closeImport"></claims-import-dialog>

      <!-- content -->
      <passport-details v-if="isCurrentView('passportDetails')"></passport-details>
      <passport-wallets v-if="isCurrentView('passportWallets')" @openUrl="openUrl"></passport-wallets>
      <passport-applications v-if="isCurrentView('passportApplications')" @openUrl="openUrl"></passport-applications>

      <!-- home view -->
      <div v-if="isCurrentView('passportHome')" class="justify-center text-center pt-n6 mt-n6">
          <div width="250" class="mt-n6">
              <v-img src="../../images/bridge-passport.png" height="250" contain></v-img>
          </div>
          <v-divider class="my-4"></v-divider>
          <div class="text-uppercase">{{passportId}}</div>
      </div>

      </v-container>
    </v-content>

    <v-footer app class="d-flex flex-row justify-space-between">
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

<script>
  import AboutDialog from '../components/AboutDialog.vue';
  import OpenDialog from '../components/OpenDialog.vue';
  import UnlockDialog from '../components/UnlockDialog.vue';
  import LoginDialog from '../components/LoginDialog.vue';
  import PaymentDialog from '../components/PaymentDialog.vue';
  import ClaimsImportDialog from '../components/ClaimsImportDialog.vue';
  import PassportDetails from '../components/PassportDetails.vue';
  import PassportWallets from '../components/PassportWallets.vue';
  import PassportApplications from '../components/PassportApplications.vue';

  export default {
    components: {
      AboutDialog,
      OpenDialog,
      UnlockDialog,
      LoginDialog,
      PaymentDialog,
      ClaimsImportDialog,
      PassportDetails,
      PassportWallets,
      PassportApplications
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
      loginDialog: false,
      paymentDialog: false,
      claimsImportDialog: false,
      request: null,
      sender: null,
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
      openPassport: async function(){
        this.unlockDialog = false;
        this.openDialog = false;
        this.currentView = "passportHome";
        let passportContext = await BridgeExtension.getPassportContext();
        this.passportLoaded = true;
        this.passportId = passportContext.passport.id;
      },
      closePassport: async function(){
          this.currentView = "";
          this.passportId = "";
          await BridgeExtension.closePassport();
          await this.checkPassportStatus();
      },
      removePassport: async function(){
          this.currentView = "";
          this.passportId = "";
          await BridgeExtension.removePassport();
          await this.checkPassportStatus();
      },
      exportPassport: async function(){
          let passportContext = await BridgeExtension.getPassportContext();
          await BridgeExtension.exportPassport(passportContext.passport);
      },
      checkPassportStatus: async function(){
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
        this.sender = null;
        this.request = null;
        this.loginDialog = false;

        await BridgeExtension.sendLoginResponse(res.sender, res.response);
        this.currentView = "passportHome";
      },
      closeImport: async function(){
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
      await app.checkPassportStatus();
      window.browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
          if (request.target != "popup")
              return;

          if (request.action === "login") {
              window.focus();
              app.sender = request.sender;
              app.request = request.loginRequest;
              app.loginDialog = true;
          }

          if (request.action === "payment") {
              window.focus();
              app.sender = request.sender;
              app.request = request.paymentRequest;
              app.paymentDialog = true;
          }

          if (request.action === "claimsImport") {
              window.focus();
              app.sender = request.sender;
              app.request = request.claimsImportRequest;
              app.claimsImportDialog = true;
          }
          sendResponse();
      });

      //If we were launched from an external request whille closed, now that we're loaded, handle the request
      let params = BridgeExtension.getQueryStringFromLocation();
      if (params) {
          let request = BridgeExtension.getParamRequest(params);
          if (request.action === "login") {
              window.focus();
              app.sender = request.sender;
              app.request = request.loginRequest;
              app.loginDialog = true;
          }
          else if (requst.action === "payment") {
              window.focus();
              app.sender = request.sender;
              app.request = request.paymentRequest;
              app.paymentDialog = true;
          }
      }
  }
</script>