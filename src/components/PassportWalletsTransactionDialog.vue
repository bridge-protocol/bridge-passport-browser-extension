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
                    <div :class="transaction.class" style="padding-left:6px;">
                        <v-row dense>
                            <v-col cols="2">Date</v-col>
                            <v-col cols="10" class="caption">{{transaction.date}}</v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="2">{{transaction.send ? "To" : "From"}}</v-col>
                            <v-col cols="auto" class="mx-0">
                                <v-icon small color="accent" class="ma-0 pa-0">{{transaction.send ? "mdi-arrow-right-bold":"mdi-arrow-left-bold"}}</v-icon>
                            </v-col>
                            <v-col cols="auto" class="caption">{{transaction.address}}</v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="2">Amount</v-col>
                            <v-col cols="9" class="caption">{{transaction.amount}} BRDG</v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="2">Link</v-col>
                            <v-col cols="10" class="caption"><a @click="openUrl(transaction.url)">{{transaction.url}}</a></v-col>
                        </v-row>
                        <v-divider v-if="i + 1 < transactions.length"></v-divider>
                    </div>  
                </template>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-container text-center>
                    <v-btn color="accent" @click="close()">Close</v-btn>
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

            transactions[i].send = true;
            transactions[i].address = transactions[i].to;
            if(transactions[i].to.toUpperCase() === this.wallet.address.toUpperCase())
            {
                transactions[i].send = false;
                transactions[i].address = transactions[i].from;
            }

            if(transactions[i].to.toUpperCase() === BridgeProtocol.Constants.ethereumSwapAddress.toUpperCase() ||
                transactions[i].to.toUpperCase() === BridgeProtocol.Constants.neoSwapAddress.toUpperCase())
            {
                //transactions[i].address = "Bridge Token Swap";
            }
        }

        this.transactions = transactions;
        this.loading = false;
    }
};
</script>