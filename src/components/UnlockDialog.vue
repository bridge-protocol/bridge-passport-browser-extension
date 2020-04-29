<template>
    <v-overlay :opacity="1">
        <v-dialog v-model="visible" persistent max-width="600px">
            <v-card>
                <v-toolbar
                    color="gradient"
                    dark
                    >
                    <v-toolbar-title class="subtitle-1">Unlock Passport</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <div class="caption text-justify mt-4">
                        To unlock your passport, please provide the password you provided when it was created.
                    </div>
                    <v-row>
                        <v-col cols="12">
                        <v-text-field v-model="unlockPassword" outlined color="secondary" label="Password" type="password" required></v-text-field>
                        <div>{{ unlockErrorMessage }}</p>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="unload();">Unload Passport</v-btn>
                    <v-btn color="secondary" @click="verifyUnlockPassword();">Unlock</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-overlay>
</template>

<script>
export default {
    name: 'unlock-dialog',
    data: function () {
        return {
            visible: true,
            unlockPassword: "",
            unlockErrorMessage: ""
        }
    },
    methods:{
        verifyUnlockPassword: async function(){
            let passportContent = await BridgeExtension.loadPassportFromBrowserStorage();
            let passport = new BridgeProtocol.Models.Passport();
            let success = false;
            try{
                success = await passport.open(passportContent, this.unlockPassword);
            }
            catch(err){
                console.log(err.message);
            }

            if(success){
                await BridgeExtension.savePassportToBrowserStorage(passport);
                await BridgeExtension.savePassphrase(this.unlockPassword);
                this.$emit('unlocked', true);
            }
            else{
                this.unlockErrorMessage = "Invalid password, try again.";
            }
        },
        unload: function(){
            this.$emit('unload', true);
        }
    }
};
</script>