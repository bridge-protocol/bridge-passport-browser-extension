<template>
    <v-dialog v-model="visible" persistent scrollable overlay-opacity=".8">
        <v-card dark>
            <v-toolbar
                v-if="!loading"
                color="gradient"
                dark
                >
                <v-toolbar-title class="subtitle-1">Recent Transactions</v-toolbar-title>
            </v-toolbar>
            <v-card-text class="pt-2">
                <v-progress-circular
                indeterminate
                color="secondary"
                style="margin-left:50%;"
                v-if="loading"
                ></v-progress-circular>
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
            <v-divider></v-divider>
            <v-card-actions>
                <v-container text-center>
                    <v-btn color="secondary" @click="close()">Close</v-btn>
                </v-container>
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