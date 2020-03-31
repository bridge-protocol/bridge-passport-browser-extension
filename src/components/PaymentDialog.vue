<template>
    <v-overlay :opacity="1">
        <v-dialog v-model="visible" persistent max-width="600px">
           <v-card>
                <v-card-title>
                    <span class="headline">Payment Request Received</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" class="text-truncate">
                                {{paymentRequest}}
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="pay();">Make Payment</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-overlay>
</template>

<script>
export default {
    name: 'payment-request-dialog',
    props: ['sender','request'],
    data: function () {
        return {
            visible: true,
            paymentRequest: null
        }
    },
    methods:{
        pay: async function(){
            let passportContext = await BridgeExtension.getPassportContext();
            let response = this.paymentRequest;
            let sender = this.sender;

            this.$emit('paymentSent', { sender, response });
        }
    },
    async created () {
        this.paymentRequest = this.request;
    }
};
</script>