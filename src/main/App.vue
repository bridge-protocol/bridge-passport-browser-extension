<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      permanent
    >
      <v-list dense>
        <v-list-item :disabled="!passportLoaded" :class="isCurrentView('passportDetails') ? 'primary':''" link @click="currentView = 'passportDetails'">
          <v-list-item-action>
            <v-icon>mdi-fingerprint</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title >My Digital Identity</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link :disabled="!passportLoaded" :class="isCurrentView('passportWallets') ? 'primary':''" @click="currentView = 'passportWallets'">
          <v-list-item-action>
            <v-icon>mdi-wallet</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>My Blockchain Wallets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link :disabled="!passportLoaded" :class="isCurrentView('passportApplications') ? 'primary':''" @click="currentView = 'passportApplications'">
          <v-list-item-action>
            <v-icon>mdi-shopping</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Bridge Marketplace</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item color="red" link @click="openPage('https://bridgeprotocol.azurewebsites.net/')">
          <v-list-item-action>
            <v-icon>mdi-compass</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Bridge Network Explorer</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
    >
      <v-toolbar-title><v-img src="../../images/bridge-white.png" contain height="30" aspect="1" position="left" @click.stop="drawer = !drawer"></v-img></v-toolbar-title>

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
        class="fill-height"
        fluid
      >

      <!-- about dialog -->
      <about-dialog v-if="aboutDialog" @close="aboutDialog = false" @open="openPage"></about-dialog>

      <!-- open dialog -->
      <open-dialog v-if="openDialog" @unlocked="openPassport()"></open-dialog>

      <!-- unlock dialog -->
      <unlock-dialog v-if="unlockDialog" @unlocked="openPassport()"></unlock-dialog>

      <!-- content -->
      <passport-details v-if="isCurrentView('passportDetails')" :passport="passportId"></passport-details>
      <passport-wallets v-if="isCurrentView('passportWallets')" :passport="passportId"></passport-wallets>
      <passport-applications v-if="isCurrentView('passportApplications')" :passport="passportId"></passport-applications>

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
  import PassportDetails from '../components/PassportDetails.vue';
  import PassportWallets from '../components/PassportWallets.vue';
  import PassportApplications from '../components/PassportApplications.vue';

  export default {
    components: {
      AboutDialog,
      OpenDialog,
      UnlockDialog,
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
      drawer: null,
      currentYear: new Date().getFullYear(),
      passportVersion: BridgeExtension.version,
      currentView: ""
    }),
    methods: {
      isCurrentView: function(name){
        return this.currentView === name;
      },
      openPage: function(url){
        BridgeExtension.openPage(url);
      },
      openPassport: async function(){
        this.unlockDialog = false;
        this.openDialog = false;
        this.currentView = "passportDetails";
        let passportContext = await BridgeExtension.getPassportContext();
        this.passportLoaded = true;
        this.passportId = passportContext.passport.id;
      },
      closePassport: async function(){
          await BridgeExtension.closePassport();
          await this.checkPassportStatus();
      },
      removePassport: async function(){
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
      }
    },
    async created () {
      this.$vuetify.theme.dark = true;
      await this.checkPassportStatus();
    }
  }
</script>