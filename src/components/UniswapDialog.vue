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
        <v-card class="mx-0 px-0" v-if="!loading">
            <v-toolbar
                color="gradient"
                dark
                >
                <v-toolbar-title class="subtitle-1">Buy Tokens on Uniswap</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-row dense class="mt-4 px-0 mx-0">
                    <v-col cols="12" class="text-center mt-0">
                        <v-img src="../images/uniswap.png" height="54" contain></v-img>
                    </v-col>
                </v-row>    
                <v-row dense class="px-0 mx-0 mt-4">
                    <v-col cols="4" class="mt-2 text-right">
                        Buy Amount
                    </v-col>
                    <v-col cols="auto" class="text-center">
                        <v-text-field
                            v-model="brdgAmount"
                            name="brdgAmount"
                            outlined
                            dense
                            color="secondary"
                            required
                            :rules="[rules.required, rules.gtzero, rules.wholeamount]"
                        >
                        </v-text-field>
                    </v-col>
                <v-row>
                <v-row dense class="px-0 mx-0 mt-0">
                    <v-col cols="4" class="mt-2 text-right">
                        Slippage %
                    </v-col>
                    <v-col cols="auto" class="text-center">
                        <v-text-field
                            v-model="slippage"
                            name="slippage"
                            outlined
                            dense
                            color="secondary"
                            required
                            :rules="[rules.required, rules.gtzero]"
                        >
                        </v-text-field>
                    </v-col>
                <v-row>
            </v-card-text>
            <v-card-text class="mx-0 mt-n2 text-justify" style="font-size:11px;">
                By clicking below, you agree that you understand the process of buying tokens on Uniswap and agree to assume all responsibility for this transaction.  Any issues arising from the transaction after the point of transmission are between the user and Uniswap, Bridge Protocol Corporation will relays the transaction on your behalf but is not involved with the actual purchase or market mechanics and will not provide end user support for your transaction.  If you prefer, you can use the Uniswap exchange directly <a @click="openUrl('https://info.uniswap.org/pair/0xa23c4aa7050425d2922956bedd9d513da1b4a977');">here</a>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="close()">Cancel</v-btn>
                <v-btn color="accent"  @click="buy()" v-if="!insufficientBalance && !error">Send Buy Request to Uniswap</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'uniswap-dialog',
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
            slippage: 50,
            insufficientBalance: false,
            insufficientBalanceErrorMessage: "",
            sent: false,
            statusMessage: null,
            swapTxId: null,
            error: false,
            pendingSwap: false,
            pendingSwapInfo: null,
            rules: {
                required: value => !!value || 'BRDG amount required',
                gtzero: value => {
                    let amt = parseFloat(value);
                    if(amt > 0){
                        this.error = false;
                        return true;
                    }
                        
                    this.error = true;
                    return 'BRDG amount must be greater than zero';
                },
                wholeamount: value => {
                    let amt = parseFloat(value);
                    if(amt % 1 === 0){
                        this.error = false;
                        return true;
                    }

                    return 'Please use a whole number';
                }
            }
        }
    },
    methods:{
        getBalances: async function(){
            // let fromBalances = await BridgeExtension.getWalletBalances(this.from);
            // let toBalances = await BridgeExtension.getWalletBalances(this.to);
            // //Calculate the GAS cost
            // this.brdgBalance = fromBalances.brdg;
            // if(this.from.network.toLowerCase() === "neo"){
            //     this.gasBalance = toBalances.gas;
            // }
            // else{
            //     this.gasBalance = fromBalances.gas;
            // }

            // this.totalGasCost = await BridgeProtocol.Services.Blockchain.sendTokenSwapRequest(this.passportContext.passport, this.passportContext.passphrase, this.from, this.to, 1, true);

            // if(this.gasBalance < this.totalGasCost){
            //     this.insufficientBalance = true;
            //     this.insufficientBalanceErrorMessage = "There is not enough ETH in the wallet to cover transaction GAS costs for the swap.";
            // }
        },
        buy: async function(){
            let app = this;
            this.loading = true;
            this.loadingMessage = "Sending token buy transaction";
            window.setTimeout(async function(){
                //Unlock the wallet
                let passportContext = await BridgeExtension.getPassportContext();
                let passport = passportContext.passport;
                let wallet = passport.getWalletForNetwork("eth");
                await wallet.unlock(passportContext.passphrase);
                alert(wallet.address);

                //Construct the trade
                const swap = await BridgeProtocol.Services.Blockchain.createUniswapSwap(wallet.address, app.brdgAmount);
                console.log(JSON.stringify(swap));

                //Relay the transaction
                let tx = await BridgeProtocol.Services.Blockchain.sendUniswapTradeTransaction(wallet, swap, false);
                console.log(JSON.stringify(tx));

                app.error = false;
                app.sent = true;
                app.loading = false;
            },500);
        },
        close: function(){
            this.$emit('close', true);
        },
        openUrl(url){
            window.open(url);
        },
        viewTransaction(transactionId){
            let url = "https://etherscan.io/tx/" + transactionId;
            this.openUrl(url);
        }
    },
    mounted: async function(){
        this.loading = true;
        await this.getBalances();
        this.loading = false;
    }
};
</script>