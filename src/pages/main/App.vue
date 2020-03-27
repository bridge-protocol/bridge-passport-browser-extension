<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      permanent
    >
      <v-list dense>
        <v-list-item link @click="currentView = 'passportDetails'">
          <v-list-item-action>
            <v-icon>mdi-fingerprint</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>My Digital Identity</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link @click="currentView = 'passportWallets'">
          <v-list-item-action>
            <v-icon>mdi-wallet</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>My Blockchain Wallets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link @click="currentView = 'passportApplications'">
          <v-list-item-action>
            <v-icon>mdi-shopping</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Bridge Marketplace</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link @click="">
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

          <v-list-item two-line @click="">
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
         <v-list-item two-line  @click="">
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
          <v-list-item two-line  @click="">
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
          
          <v-list-item @click="showAboutDialog">
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

      <!-- overlay to mask background -->
      <v-overlay :value="overlay" :opacity="overlayOpacity"></v-overlay>

      <!-- about dialog -->
      <v-dialog v-model="about_dialog" persistent max-width="600">
        <v-card>
          <v-card-title class="headline">About Bridge Passport</v-card-title>
          <v-card-text>Bridge Passport information, license info, etc</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="hideAboutDialog()">Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- unlock dialog -->
      <v-dialog v-model="unlock_dialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Unlock Passport</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="unlockPassword" label="Password" type="password" required></v-text-field>
                  <div>{{ unlockErrorMessage }}</p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="verifyUnlockPassword();">Unlock</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- content -->
      <passport-details v-if="isCurrentView('passportDetails')"></passport-details>
      <passport-wallets v-if="isCurrentView('passportWallets')"></passport-wallets>
      <passport-applications v-if="isCurrentView('passportApplications')"></passport-applications>

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
  import PassportDetails from '../../components/PassportDetails.vue';
  import PassportWallets from '../../components/PassportWallets.vue';
  import PassportApplications from '../../components/PassportApplications.vue';

  export default {
    components: {
      PassportDetails,
      PassportWallets,
      PassportApplications
    },
    props: {
      source: String,
    },
    data: () => ({
      overlayOpacity: 1,
      overlay: false,
      unlock_dialog: false,
      unlockErrorMessage: "",
      about_dialog: false,
      drawer: null,
      currentYear: new Date().getFullYear(),
      passportVersion: BridgeExtension.version,
      currentView: ""
    }),
    methods: {
      showOverlay(overlayOpacity){
        this.overlayOpacity = overlayOpacity;
        this.overlay = true;
      },
      showAboutDialog: function(){
        this.about_dialog = true;
        this.showOverlay(.5);
      },
      isCurrentView: function(name){
        return this.currentView === name;
      },
      hideAboutDialog: function(){
        this.about_dialog = false;
        this.overlay = false;
      },
      showUnlockDialog: function () {
        this.unlock_dialog = true;
        this.showOverlay(1);
      },
      verifyUnlockPassword: async function(){
        await verifyPassword(this);
      }
    },
    async created () {
      this.$vuetify.theme.dark = true;
      await checkPassportLoaded(this); 
    },
  }

  async function verifyPassword(app){
    let password = app.unlockPassword;
    if(password === "123"){
      app.unlock_dialog = false;
      app.overlay = false;
      app.currentView = "passportDetails";
    }
    else{
      app.unlockErrorMessage = "Invalid password, try again.";
    }
  }

  async function checkPassportLoaded(app){
      //Check the passport lock status, etc
      let passportContext = await BridgeExtension.getPassportContext();
      app.showUnlockDialog();
  }
</script>