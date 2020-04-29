<template>
    <v-dialog v-model="visible" overlay-opacity=".8">
        <v-card>
            <v-card-text fill-height align-middle class="mx-0 px-0 my-0 py-0">
                <v-progress-circular
                indeterminate
                color="secondary"
                style="margin-left:50%;"
                v-if="loading"
                ></v-progress-circular>
                <v-toolbar
                    v-if="!loading"
                    color="gradient"
                    dark
                    >
                    <v-toolbar-title class="subtitle-1">Recent Transactions</v-toolbar-title>
                </v-toolbar>
                <v-container v-if="!loading && transactions.length == 0">
                    No recent transactions found.
                </v-container>
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
            loading: true,
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
    mounted: async function(){
        let transactions = await BridgeProtocol.Services.Blockchain.getRecentTransactions(this.wallet.network, this.wallet.address);

        if(!transactions)
            transactions = [];

        for(let i=0; i<transactions.length; i++){
            let date = new Date(transactions[i].timeStamp * 1000); 
            transactions[i].date = date.toLocaleDateString() + " " + date.toLocaleTimeString();
            //Old transaction format
            if(transactions[i].amount == 1000000000)
                transactions[i].amount = 1;
        }

        this.transactions = transactions;
        this.loading = false;
    }
};
</script>