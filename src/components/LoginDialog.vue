<template>
    <v-overlay :opacity="1">
        <v-dialog v-model="visible" persistent max-width="600px">
           <v-card>
                <v-card-title>
                    <span class="headline">Login Request Received</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" class="text-truncate">
                                {{loginRequest}}
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="login();">Login with Passport</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-overlay>
</template>

<script>
export default {
    name: 'login-request-dialog',
    props: ['sender','request'],
    data: function () {
        return {
            visible: true,
            loginRequest: null
        }
    },
    methods:{
        login: async function(){
            let response = this.loginRequest;
            let sender = this.sender;
            this.$emit('login', { sender, response });
        }
    },
    async created () {
        this.loginRequest = this.request;
    }
};
</script>