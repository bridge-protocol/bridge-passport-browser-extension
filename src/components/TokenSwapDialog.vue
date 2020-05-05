<template>
    <v-dialog v-model="visible" persistent overlay-opacity=".8">
        <v-card v-if="loading" class="py-12">
            <v-container text-center align-middle>
                <v-progress-circular
                    indeterminate
                    color="secondary"
                ></v-progress-circular>
                <v-container>{{loadingMessage}}</v-container>
            </v-container>  
        </v-card>
        <v-card class="mx-0 px-0" v-if="!loading">
            <v-toolbar
                color="gradient"
                dark
                >
                <v-toolbar-title class="subtitle-1">Token Swap</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                    <p class="mt-4 mb-0">
                        TOKEN SWAP FROM {{this.from.network}}:{{this.from.address}} to {{this.to.network}}:{{this.to.address}}
                    </p>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="cancel()">Cancel</v-btn>
                <v-btn color="secondary" @click="swap()" v-if="!insufficientBalance">Send Token Swap Request</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'token-swap-dialog',
    props: ['from','to'],
    data: function () {
        return {
            visible: true,
            loading: false,
            loadingMessage: "Please wait",
            passportContext: null,
            wallet: null,
            gasLabel: null,
            totalGasCost: 0,
            gasBalance: 0,
            insufficientBalance: false,
            insufficientBalanceErrorMessage: ""
        }
    },
    methods:{
        swap: async function(){
            this.loading = true;
            this.loadingMessage = "Sending token swap";
            try
            {
                this.$emit('close', true);
                this.loading = false;
             }
            catch(err){
                alert("Unable to publish claim: " + err.message);
                console.log(err);
                this.$emit('close', true);
            }
        },
        cancel: function(){
            this.$emit('close', true);
        }
    },
    created: async function(){
        this.loading = true;
        this.passportContext = await BridgeExtension.getPassportContext();
        this.loading = false;
    }
};
</script>