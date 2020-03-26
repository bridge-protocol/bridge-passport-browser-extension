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
      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <v-btn
            :href="source"
            icon
            target="_blank"
            v-on="on"
          >
          <v-icon small>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <span>Lock Passport</span>
      </v-tooltip>
    </v-app-bar>

    <v-content>
      <v-container
        class="fill-height"
        fluid
      >
        <v-row
          align="center"
          justify="center"
        >
          <v-col class="shrink">
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn
                  :href="source"
                  icon
                  large
                  target="_blank"
                  v-on="on"
                >
                  <v-icon large>mdi-code-tags</v-icon>
                </v-btn>
              </template>
              <span>Source</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <v-footer app class="d-flex flex-row justify-space-between">
      <div>
        &copy; {{ currentYear }} Bridge Protocol Corporation
      </div>
      <div>
      </div>
      <div>
        Version {{ passportVersion }}  
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
      drawer: null,
      currentYear: new Date().getFullYear(),
      passportVersion: BridgeExtension.version
    }),
    created () {
      this.$vuetify.theme.dark = true
    },
  }
</script>