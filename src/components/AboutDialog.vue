<template>
    <v-overlay :opacity=".5">
        <v-dialog v-model="visible" persistent max-width="600">
            <v-card>
                <v-card-title class="title">About Bridge Passport Browser Extension</v-card-title>
                <v-card-text>
                    <div class="subtitle-2">Bridge Passport Browser Extension Version</div>
                    <p class="caption">
                        {{version}}
                    </p>

                    <div class="subtitle-2">License</div>
                    <p class="caption">
                        This software is licensed under the Apache 2.0 License and is being provided to you on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  Bridge Protocol Corporation will not be held liable for any loss or damages resulting from the use of this software.  If you do not agree with these terms, you must stop using this software immediately.  Please review the <a @click="openUrl('https://bridge-protocol.github.io/docs/license')">Bridge Network terms of service</a> and <a @click="openUrl('https://bridge-protocol.github.io/docs/tos')">open source license</a> before using this software.
                    </p>
                    <div class="subtitle-2">Limitation of Liability</div>
                    <p class="caption">
                        It is your responsibility to ensure that you backup your passport and associated blockchain wallet private keys.  Bridge Protocol Corporation will not be held responsible for loss of funds, verified claims data, or any other damages resulting from the use of this software.
                    </p>
                    <div class="subtitle-2">Assignment of Copyright</div>
                    <p class="caption">
                        This software, "Bridge" Logo, and any other related content are Copyright ©2018-<span>{{currentYear}}</span> Bridge Protocol Corporation, All Rights Reserved.  Some portions of this software and logos are copyright to their respective owners.
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="close()">Ok</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-overlay>
</template>

<script>
export default {
    name: 'about-dialog',
    data: function () {
        return {
            visible: true,
            currentYear: new Date().getFullYear(),
            version: BridgeExtension.version
        }
    },
    methods:{
        close: function(){
            this.$emit('close', true);
        },
        openUrl: function(url){
            window.open(url);
        }
    }
};
</script>