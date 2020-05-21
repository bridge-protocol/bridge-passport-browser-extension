<template>
    <v-dialog v-model="visible" persistent overlay-opacity=".8" max-width="600">
        <v-card v-if="loading" class="py-12">
            <v-container text-center align-middle>
                <v-progress-circular
                    indeterminate
                    color="secondary"
                ></v-progress-circular>
                <v-container>{{loadingMessage}}</v-container>
            </v-container>  
        </v-card>
        <v-card class="mx-0 px-0" v-if="!loading && !sent && !pendingSwap">
            <v-toolbar
                color="gradient"
                dark
                >
                <v-toolbar-title class="subtitle-1">Token Swap</v-toolbar-title>
            </v-toolbar>
            <v-card-text>    
                <v-row dense class="mt-4 px-0 mx-0">
                    <v-col cols="5" class="mt-6">
                        <v-img :src="'../images/' + from.network + '-logo.png'" height="30" contain></v-img>
                    </v-col>
                    <v-col cols="2" class="text-center mt-0">
                        <v-img src="../images/bridge-token-lg.png" height="40" contain></v-img>
                    </v-col>
                    <v-col cols="5" class="mt-6">
                        <v-img :src="'../images/' + to.network + '-logo.png'" height="30" contain></v-img>
                    </v-col>
                </v-row>
                <v-row dense class="px-0 mx-0">
                    <v-col cols="5" class="text-center text-truncate px-0 mx-0" style="font-size:11px;">
                        {{from.address}}
                    </v-col>
                    <v-col cols="2" class="text-center pa-0 mb-0 mt-n1"><v-icon large color="grey">mdi-arrow-right-bold</v-icon></v-col>
                    <v-col cols="5" class="text-center text-truncate px-0 mx-0" style="font-size:11px;">
                        {{to.address}}  
                    </v-col>
                </v-row>
                <v-row dense class="px-0 mx-0 mt-4">
                    <v-col cols="4" class="pt-9 text-right">
                        Swap Amount
                    </v-col>
                    <v-col cols="4" class="text-center">
                        <div style="font-size:10px;">{{brdgBalance}} Available</div>
                        <v-text-field
                            v-model="brdgAmount"
                            name="brdgAmount"
                            outlined
                            dense
                            color="secondary"
                            required
                            :rules="[rules.required, rules.gtzero, rules.ltbalance]"
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="4" class="ml-n5">
                        <v-btn text color="accent" class="pt-9" @click="setMax()">Max</v-btn>
                    </v-col>
                <v-row>
                <v-row dense class="px-0 mx-0 my-n2">
                    <v-col cols="4" class="pt-9 text-right">
                        ETH Required
                    </v-col>
                    <v-col cols="4" class="text-center">
                        <div style="font-size:10px;">{{gasBalance}} Available</div>
                        <v-text-field
                            v-model="totalGasCost"
                            name="totalGasCost"
                            outlined
                            dense
                            color="secondary"
                            disabled
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="4" class="ml-n6">
                    </v-col>
                <v-row>
            </v-card-text>
            <v-card-text>
                <v-alert
                    outlined
                    color="primary"
                    type="error"
                    class="mt-2 caption text-justify"
                    v-if="insufficientBalance"
                    >
                    {{insufficientBalanceErrorMessage}}
                </v-alert>
            </v-card-text>
            <v-card-text class="mx-0 mt-n2 text-justify" style="font-size:11px;">
                Before continuing, be sure to review all transaction information and ensure that the target Ethereum address is correct.  Bridge Protocol Corporation will not be held liable for any loss arising from the use of this software, including but not limited to providing an incorrect Ethereum wallet address.  By clicking below, you agree that you have reviewed all transaction amounts, wallet addresses, and agree to assume responsibility for this transaction.
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="close()">Cancel</v-btn>
                <v-btn color="accent"  @click="swap()" v-if="!insufficientBalance && !error">Send Token Swap Request</v-btn>
            </v-card-actions>
        </v-card>
        <v-card v-if="!loading && sent && !pendingSwap">
            <v-container text-center align-middle>
                <v-container>
                    <v-alert 
                    dense
                    outlined
                    type="success" 
                    v-if="!error"
                    class="text-justify"
                >
                    Swap Transaction Sent Successfully
                </v-alert>
                <v-alert
                    dense
                    outlined
                    type="error" 
                    v-if="error"
                    class="text-justify"
                    >
                    Swap Transaction Failed: {{statusMessage}}
                </v-alert>
                <v-container class="px-0 py-0" v-if="!error">
                    <v-subheader class="pl-0 ml-0 mt-2 caption">Swap Information</v-subheader>
                    <v-divider class="mb-2"></v-divider>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Transaction Date</v-col><v-col cols="auto" class="caption">{{new Date().toLocaleDateString()}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Wallet Address</v-col><v-col cols="auto" class="caption">{{from.address}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Swap Address</v-col><v-col cols="auto" class="caption">{{to.address}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Transaction Id</v-col><v-col cols="9" class="caption text-break text-justify" style="text-size:12px;">{{swapTxId}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="caption"></v-col><v-col cols="auto" class="caption"><v-btn text x-small color="accent" @click="viewTransaction(swapTxId)" class="pl-0" v-if="swapTxId">View Transaction</v-btn></v-col></v-row>
                    <v-alert 
                        dense
                        outlined
                        type="info" 
                        class="text-justify caption"
                    >
                        Your blockchain transaction has been sent. Please wait for your transaction to process before sending other swap requests or other blockchain transactions to prevent failed transactions.  Bridge Protocol is not responsible for any lost funds due to failed transactions.
                    </v-alert>
                </v-container>
                <v-btn color="accent" @click="close()" class="mt-4">Close</v-btn>
            </v-container>  
        </v-card>
        <v-card v-if="!loading && pendingSwap">
            <v-container text-center align-middle>
                <v-alert
                    dense
                    outlined
                    type="info" 
                    class="text-justify"
                    color="primary"
                    >
                    Swap pending.  Please wait before sending another request.
                </v-alert>
                <v-container class="px-0 py-0" v-if="pendingSwapInfo != null">
                    <v-subheader class="pl-0 ml-0 mt-2 caption">Pending Swap Information</v-subheader>
                    <v-divider class="mb-2"></v-divider>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Transaction Date</v-col><v-col cols="auto" class="caption">{{pendingSwapInfo.timestamp}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Wallet Address</v-col><v-col cols="auto" class="caption">{{pendingSwapInfo.sendAddress}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Swap Address</v-col><v-col cols="auto" class="caption">{{pendingSwapInfo.receiveAddress}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Swap Amount</v-col><v-col cols="auto" class="caption px-0 mx-n2"><v-img src="../images/bridge-token.png" height="16" contain class="px-0 mx-0"></v-img></v-col><v-col cols="auto" class="caption">{{pendingSwapInfo.amount}} BRDG</v-col></v-row>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Transaction Id</v-col><v-col cols="9" class="caption text-break text-justify" style="text-size:12px;">{{pendingSwapInfo.hash}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="caption"></v-col><v-col cols="auto" class="caption"><v-btn text x-small color="accent" @click="openUrl(pendingSwapInfo.url)" class="pl-0">View Transaction</v-btn></v-col></v-row>
                </v-container>
                <v-btn color="accent" @click="close()" class="mt-4">Close</v-btn>
            </v-container>  
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
            brdgBalance: 0,
            brdgAmount: 0,
            totalGasCost: 0,
            gasBalance: 0,
            insufficientBalance: false,
            insufficientBalanceErrorMessage: "",
            sent: false,
            statusMessage: null,
            swapTxId: null,
            error: false,
            pendingSwap: false,
            pendingSwapInfo: null,
            rules: {
                required: value => !!value || 'Swap amount required',
                gtzero: value => {
                    let amt = parseFloat(value);
                    if(amt > 0){
                        this.error = false;
                        return true;
                    }
                        
                    this.error = true;
                    return 'Swap amount must be greater than zero';
                },
                ltbalance: value => {
                    let amt = parseFloat(value);
                    if(amt <= this.brdgBalance){
                        this.error = false;
                        return true;
                    }
                    
                    this.error = true;
                    return 'Swap amount must be less than available balance';
                }
            }
        }
    },
    methods:{
        getPendingSwap: async function(){
            let pendingList = await BridgeProtocol.Services.TokenSwap.getPendingTokenSwapList(this.passportContext.passport, this.passportContext.passphrase);
            //Find out if we have a pending swap for this network already
            if(pendingList != null && pendingList.length > 0){
                for(let i=0; i<pendingList.length; i++){
                    if(pendingList[i].sendTxNetwork.toLowerCase() === this.from.network.toLowerCase()){
                        this.pendingSwapInfo = {
                            hash: pendingList[i].sendTxId,
                            timestamp: new Date(pendingList[i].createdOn * 1000).toLocaleDateString(),
                            sendAddress: pendingList[i].sendAddress,
                            amount: pendingList[i].sendAmount,
                            url: pendingList[i].sendTxNetwork.toLowerCase() === "neo" ? "https://neoscan.io/transaction/" + pendingList[i].sendTxId : "https://etherscan.io/tx/" + pendingList[i].sendTxId,
                            receiveAddress: pendingList[i].receiveAddress
                        };
                        return true;
                    }
                }
            }

            return false;
        },
        checkCostsAndBalances: async function(){
            let fromBalances = await BridgeExtension.getWalletBalances(this.from);
            let toBalances = await BridgeExtension.getWalletBalances(this.to);
            //Calculate the GAS cost
            this.brdgBalance = fromBalances.brdg;
            if(this.from.network.toLowerCase() === "neo"){
                this.gasBalance = toBalances.gas;
            }
            else{
                this.gasBalance = fromBalances.gas;
            }

            this.totalGasCost = await BridgeProtocol.Services.Blockchain.sendTokenSwapRequest(this.passportContext.passport, this.passportContext.passphrase, this.from, this.to, 1, true);

            if(this.gasBalance < this.totalGasCost){
                this.insufficientBalance = true;
                this.insufficientBalanceErrorMessage = "There is not enough ETH in the wallet to cover transaction GAS costs for the swap.";
            }
        },
        swap: async function(){
            let app = this;
            this.loading = true;
            this.loadingMessage = "Sending token swap transaction";
            window.setTimeout(async function(){
                let swapId;
                try
                {
                    //Unlock the wallets
                    await app.from.unlock(app.passportContext.passphrase);
                    await app.to.unlock(app.passportContext.passphrase);

                    let res = await BridgeProtocol.Services.Blockchain.sendTokenSwapRequest(app.passportContext.passport, app.passportContext.passphrase, app.from, app.to, app.brdgAmount);

                    app.statusMessage = "Swap request sent successfully.";
                    app.swapTxId = res.sendTxId;
                    app.error = false;
                    app.sent = true;
                    app.loading = false;
                }
                catch(err){
                    console.log(err);
                    app.statusMessage = err.message;
                    app.sent = true;
                    app.error = true;
                    app.loading = false;
                }
            },500);
        },
        setMax: function(){
            this.brdgAmount = this.brdgBalance;
        },
        close: function(){
            this.$emit('close', true);
        },
        openUrl(url){
            window.open(url);
        },
        viewTransaction(transactionId){
            let url = "https://neoscan.io/tx/" + transactionId;
            if(this.from.network.toLowerCase() === "eth")
                url = "https://etherscan.io/tx/" + transactionId;
            
            this.openUrl(url);
        }
    },
    mounted: async function(){
        this.loading = true;
        this.passportContext = await BridgeExtension.getPassportContext();

        //Check for a pending swap
        this.pendingSwap = await this.getPendingSwap();
        if(!this.pendingSwap)
        {
            //Get the costs and balances
            await this.checkCostsAndBalances();
        }

        this.loading = false;
    }
};
</script>