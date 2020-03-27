<template>
    <v-overlay :opacity="1">
        <v-dialog v-model="visible" persistent max-width="600px">
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
            if(this.unlockPassword === "123"){
                this.$emit('unlocked', true);
            }
            else{
                this.unlockErrorMessage = "Invalid password, try again.";
            }
        }
    }
};
</script>