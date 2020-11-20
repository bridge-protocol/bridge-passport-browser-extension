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
        <v-card class="mx-0 px-0" v-if="!loading && !sent">
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
                    <v-col cols="5" class="text-center">
                        <v-text-field
                            v-model="amount"
                            name="amount"
                            outlined
                            dense
                            color="secondary"
                            required
                            @change="calculateCost"
                            :rules="[rules.required, rules.gtzero, rules.wholeamount]"
                        >
                        </v-text-field>
                    </v-col>
                     <v-col cols="4" class="mt-2 text-right">
                        Slippage %
                    </v-col>
                    <v-col cols="5" class="text-center">
                        <v-text-field
                            v-model="slippage"
                            name="slippage"
                            outlined
                            dense
                            color="secondary"
                            required
                            :rules="[rules.required, rules.gtzero, rules.wholeamount]"
                        >
                        </v-text-field>
                    </v-col>
                <v-row>
                <v-row dense class="px-0 mx-0 my-n6">
                    <v-col cols="4" class="pt-9 text-right">
                        Estimated Cost
                    </v-col>
                    <v-col cols="5" class="text-center">
                        <div style="font-size:10px;">{{ethBalance}} Available</div>
                        <v-text-field
                            v-model="cost"
                            name="cost"
                            outlined
                            dense
                            color="secondary"
                            readonly
                        >
                        </v-text-field>
                        <div style="font-size:11px; color:red; margin-top:-24px;">{{statusMessage}}</div>
                    </v-col>
                    <v-col cols="1" class="mt-8">
                        ETH
                    </v-col>
                <v-row>
            </v-card-text>
            <v-card-text class="mx-0 mt-3 text-justify" style="font-size:11px;">
                By clicking below, you agree that you understand the process and nuances of buying tokens on Uniswap and agree to assume all responsibility for this transaction.  Any issues arising from the transaction after the point of transmission are between the user and Uniswap, Bridge Protocol Corporation will relays the transaction on your behalf but is not involved with the actual purchase or market mechanics and will not provide end user support for your transaction.  If you prefer, you can use the Uniswap exchange directly <a @click="openUrl('https://info.uniswap.org/pair/0xa23c4aa7050425d2922956bedd9d513da1b4a977');">here</a>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="close()">Cancel</v-btn>
                <v-btn color="accent"  @click="buy()" v-if="!insufficientBalance && !error">Send Buy Request to Uniswap</v-btn>
            </v-card-actions>
        </v-card>
        <v-card v-if="!loading && sent">
            <v-container text-center align-middle>
                <v-container>
                    <v-alert 
                    dense
                    outlined
                    type="success" 
                    v-if="!error"
                    class="text-justify"
                >
                    Uniswap Transaction Sent Successfully
                </v-alert>
                <v-alert
                    dense
                    outlined
                    type="error" 
                    v-if="error"
                    class="text-justify"
                    >
                    Uniswap Transaction Failed: {{statusMessage}}
                </v-alert>
                <v-container class="px-0 py-0" v-if="!error">
                    <v-subheader class="pl-0 ml-0 mt-2 caption">Swap Information</v-subheader>
                    <v-divider class="mb-2"></v-divider>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Transaction Date</v-col><v-col cols="auto" class="caption">{{new Date().toLocaleDateString()}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Wallet Address</v-col><v-col cols="auto" class="caption">{{address}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="font-weight-bold caption text-left">Transaction Id</v-col><v-col cols="9" class="caption text-break text-justify" style="text-size:12px;">{{txId}}</v-col></v-row>
                    <v-row dense><v-col cols="3" class="caption"></v-col><v-col cols="auto" class="caption"><v-btn text x-small color="accent" @click="viewTransaction(txId)" class="pl-0" v-if="txId">View Transaction</v-btn></v-col></v-row>
                    <v-alert 
                        dense
                        outlined
                        type="info" 
                        class="text-left caption"
                        color="primary"
                        class="mt-2"
                    >
                        NOTE: Bridge Protocol Corporation has relayed the transaction on your behalf to Uniswap, but is not involved with the actual purchase or market mechanics and cannot provide end user support for your transaction.  View your transaction on Etherscan to track the transaction.
                    </v-alert>
                </v-container>
                <v-btn color="accent" @click="close()" class="mt-4">Close</v-btn>
            </v-container>  
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
            wallet: null,
            address: null,
            ethBalance: 0,
            amount: 1,
            slippage: 50,
            cost: 0,
            insufficientBalance: false,
            insufficientBalanceErrorMessage: "",
            sent: false,
            statusMessage: null,
            txId: null,
            error: false,
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
            let balances = await BridgeExtension.getWalletBalances(this.wallet);
            this.ethBalance = balances.native;
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

                try{
                    //Construct the trade
                    const swap = await BridgeProtocol.Services.Blockchain.createUniswapSwap(wallet.address, app.amount);
                    console.log(JSON.stringify(swap));

                    //Relay the transaction
                    let tx = await BridgeProtocol.Services.Blockchain.sendUniswapTradeTransaction(wallet, swap, false);
                    console.log(JSON.stringify(tx));
                    
                    if(!tx)
                        throw new Error("Error relaying transaction");

                    app.txId = tx;
                    app.sent = true;
                    app.error = false;
                }
                catch(err){
                    app.statusMessage = err.message;
                    app.error = true;
                    app.sent = false;
                }

                app.loading = false;
            },500);
        },
        calculateCost: async function(){
            //Construct the trade
            this.loading = true;
            try{
                const swap = await BridgeProtocol.Services.Blockchain.createUniswapSwap(this.wallet.address, this.amount);
                if(!swap){
                    alert("Insufficient liquidity to fill order");
                    this.amount = 1;
                    this.calculateCost();
                }
                else{
                    //Get the current gas price
                    let price = await BridgeProtocol.Services.Blockchain.getUniswapTransactionCost();
                    this.cost = parseFloat(swap.value) + parseFloat(price);
                    this.cost = this.cost.toFixed(6);
                }
            }
            catch(err){
                alert(err.message);
            }

            if(this.cost > this.ethBalance)
            {
                this.statusMessage = "Insufficient funds for purchase amount";
                this.insufficientBalance = true;
            }
            else{
                this.statusMessage = null;
                this.insufficientBalance = false;
            }

            this.loading = false;
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
        let passportContext = await BridgeExtension.getPassportContext();
        let passport = passportContext.passport;
        this.wallet = passport.getWalletForNetwork("eth");
        this.address = this.wallet.address;
        await this.getBalances();
        await this.calculateCost();
        this.loading = false;
    }
};
</script>