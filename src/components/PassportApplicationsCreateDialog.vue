<template>
    <v-dialog v-model="visible" persistent max-width="600">
        <v-card>
            <v-card-title class="title">New Marketplace Request</v-card-title>
            <v-card-text>

            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="close()">Cancel</v-btn>
                <v-btn text @click="create()">Create Request</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'application-create-dialog',
    data: function () {
        return {
            visible: true
        }
    },
    methods:{
        close: function(){
            this.$emit('close', true);
        },
        create: function(){
            this.$emit('created', true);
        },
        openPage: function(url){
            this.$emit('openUrl', url);
        }
    }
};
</script>