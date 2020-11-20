<template>
    <v-overlay :opacity=".5">
        <v-dialog v-model="visible" persistent max-width="400">
            <v-card>
                <v-toolbar
                    color="gradient"
                    dark
                    >
                    <v-toolbar-title class="subtitle-1">Send to Mobile Passport</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-container v-if="loading" align-middle class="mx-0 my-14 px-0 py-0">
                        <v-progress-circular
                            indeterminate
                            color="secondary"
                            style="margin-left: 50%;"
                        ></v-progress-circular>
                    </v-container>
                    <v-container v-if="!loading" align-middle class="mx-0 my-0 px-0 py-0" style="min-height: 300px;">
                        <v-container align-middle class="mx-0 my-2 px-0 py-2">
                            Scan the QR Code with your Bridge Mobile Passport App to import your passport to your mobile device.
                        </v-container>
                        <v-img :src="codeUrl" height="250" contain></v-img>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="close()">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-overlay>
</template>

<script>
export default {
    name: 'handoff-dialog',
    data: function () {
        return {
            visible: true,
            loading: true,
            codeUrl: '../../images/bridge-passport.png'
        }
    },
    methods:{
        close: function(){
            this.$emit('close', true);
        },
        async init() {
            await this.refreshCode();
        },
        async refreshCode(){
          let passportContext = await BridgeExtension.getPassportContext();
          let res = await BridgeExtension.handoffPassport(passportContext.passport, passportContext.passphrase);
          let code = await BridgeExtension.getQRCode(res.id);
          this.codeUrl = code;
          this.loading = false;
          setTimeout(this.refreshCode, 60000);
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.init();
        });
    }
};
</script>