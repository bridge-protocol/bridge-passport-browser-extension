<template>
    <v-dialog v-model="visible" max-width="600px">
        <v-card>
            <v-card-title class="title">
                <v-row>
                    <v-col cols="auto"><v-img src="../images/bridge-token.png" width="36"></v-img></v-col>
                    <v-col cols="10">Recent Transactions</v-col>
                </v-row>
            </v-card-title>
            <v-card-text style="mx-0 px-0 my-0 py-0">
                <v-progress-circular
                indeterminate
                color="secondary"
                v-if="loading"
                ></v-progress-circular>
                <template v-for="(transaction, i) in transactions">
                    <v-row dense>
                        <v-col cols="2">Date</v-col>
                        <v-col cols="10" class="caption">{{transaction.date}}</v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="2">Amount</v-col>
                        <v-col cols="10" class="caption">{{transaction.amount}} BRDG</v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="2">To</v-col>
                        <v-col cols="10" class="caption">{{transaction.to}}</v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="2">Link</v-col>
                        <v-col cols="10" class="caption"><a @click="openUrl(transaction.url)">{{transaction.url}}</a></v-col>
                    </v-row>
                    <v-divider v-if="i + 1 < transactions.length"></v-divider>
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="close()">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'transaction-dialog',
    props: ['wallet'],
    data: function () {
        return {
            visible: true,
            transactions: []
        }
    },
    methods:{
        close: function(){
            this.$emit('close', true);
        },
        openUrl: function(url){
            this.$emit('openUrl', url);
        }
    },
    created: async function(){
        let transactions = await BridgeProtocol.Services.Blockchain.getRecentTransactions(this.wallet.network, this.wallet.address);
        for(let i=0; i<transactions.length; i++){
            let date = new Date(transactions[i].timeStamp * 1000); 
            transactions[i].date = date.toLocaleDateString() + " " + date.toLocaleTimeString();
            //Old transaction format
            if(transactions[i].amount == 1000000000)
                transactions[i].amount = 1;
        }
        this.transactions = transactions;
    }
};
</script>