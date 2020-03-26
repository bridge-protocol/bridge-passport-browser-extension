<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      permanent
    >
      <v-list dense>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-fingerprint</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>My Digital Identity</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-wallet</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>My Blockchain Wallets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-shopping</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Bridge Marketplace</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link>
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

          <v-dialog v-model="about_dialog" persistent max-width="600">
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on">
                  <v-list-item-icon>
                    <v-icon>mdi-information</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>About Bridge Passport</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
            </template>
            <v-card>
              <v-card-title class="headline">Use Google's location service?</v-card-title>
              <v-card-text>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="about_dialog = false">Disagree</v-btn>
                <v-btn text @click="about_dialog = false">Agree</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content>
      <v-container
        class="fill-height"
        fluid
      >

      <!-- content -->


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
  export default {
    props: {
      source: String,
    },
    data: () => ({
      about_dialog: false,
      drawer: null,
      currentYear: new Date().getFullYear(),
      passportVersion: BridgeExtension.version
    }),
    created () {
      this.$vuetify.theme.dark = true
    },
  }
</script>