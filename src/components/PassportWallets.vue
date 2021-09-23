<template>
    <v-container fill-height align-start class="mx-0 my-0 px-0 py-0">
        <v-alert
            border="left"
            colored-border
            type="info"
            elevation="2"
            class="mt-2 text-left"
            v-if="!refreshing && wallets && wallets.length == 0"
            >
            No blockchain wallets found.  Add or import a wallet below to get started.
        </v-alert>
        <v-btn
                dark
                fab
                top 
                right
                color="accent"
                @click="addDialog = true"
                v-if="!refreshing && wallets && wallets.length < 3"
                style="position:fixed; right: 10px; top:70px; z-index:500;"
            >
                <v-icon link>mdi-plus</v-icon>
        </v-btn>
        <v-expansion-panels v-if="!refreshing">
            <v-expansion-panel
            v-for="(wallet) in wallets"
            :key="wallet.network+wallet.address"
            @click="walletSelected(wallet)"
            >
                <v-expansion-panel-header class="left-border-color-primary pt-1 pb-1">
                    <v-row>
                        <v-col cols="auto"><v-img :src="wallet.src" height="40" width="40"></v-img></v-col>
                        <v-col cols="auto">
                            <div class="my-1 title-2" v-text="wallet.networkName"></div>
                            <div class="caption">{{wallet.address}}</div>
                        </v-col>
                    <v-row>
                </v-expansion-panel-header>
                <v-expansion-panel-content class="left-border-color-primary">
                    <div class="text-center" v-if="!wallet.loaded">
                        <v-progress-circular
                            indeterminate
                            color="secondary"
                        ></v-progress-circular>
                    </div>
                    <div v-if="wallet.loaded">
                        <div class="float-right pt-4">
                            <v-btn x-small class="accent" @click="showTransactions(wallet)">View Transactions</v-btn>
                        </div>
                        <v-subheader class="pl-0 ml-0 caption">Balances</v-subheader>
                        <v-divider class="mb-2"></v-divider>
                        <v-row dense v-if="wallet.network.toLowerCase() === 'neo'">
                            <v-col cols="auto" class="text-left">
                                <v-img :src="'/images/neo-logo.png'" height="20" contain></v-img>
                            </v-col>
                            <v-col cols="auto" class="text-left align-end">{{wallet.nativeBalance}} NEO</v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="auto" class="text-left">
                                <v-img :src="'/images/' + wallet.network.toLowerCase() + '-gas-logo.png'" height="20" contain></v-img>
                            </v-col>
                            <v-col cols="auto" class="text-left">{{wallet.gasBalance}} {{wallet.gasBalanceLabel}}</v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="auto" class="text-left">
                                <v-img :src="'/images/bridge-token.png'" height="20" contain></v-img>
                            </v-col>
                            <v-col cols="auto" class="text-left align-end">{{wallet.brdgBalance}} BRDG</v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="1" class="text-right">
                             
                            </v-col>
                            <v-col cols="auto">
                                <v-btn v-if="wallet.network.toLowerCase() === 'eth'" @click="buyUniswap(wallet);" small color="accent">
                                    Buy on <img src="/images/uniswap.png" contain class="ml-1 mr-0" style="margin-top: -2px !important; height:20px !important;"></img>
                                </v-btn>
                                <v-btn v-if="wallet.brdgBalance > 0" @click="tokenSwap(wallet.network);" small color="accent">
                                    Swap Tokens
                                    <img :src="'/images/' + wallet.network.toLowerCase() + '-logo-white-nopad.png'" class="ml-1 mr-0" style="height:16px !important;"></img>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-subheader class="pl-0 ml-0 caption">Address</v-subheader>
                        <v-divider class="mb-2"></v-divider>
                        <v-row dense>
                            <v-col cols="auto" class="text-left">
                                <v-img :src="'/images/' + wallet.network.toLowerCase() + '-logo.png'" height="20" contain></v-img>
                            </v-col>
                            <v-col cols="auto" class="text-left">{{wallet.address}}</v-col>
                            <v-col cols="auto">
                                <v-btn text v-if="wallet.network.toLowerCase() === 'neo'" @click="openUrl('https://neoscan.io/address/' + wallet.address);" x-small color="accent" class="pl-0">View on Neoscan</v-btn>
                                <v-btn text v-if="wallet.network.toLowerCase() === 'eth'" @click="openUrl('https://etherscan.io/address/' + wallet.address);" x-small color="accent" class="pl-0">View on Etherscan</v-btn>
                                <v-btn text v-if="wallet.network.toLowerCase() === 'bsc'" @click="openUrl('https://bscscan.com/address/' + wallet.address);" x-small color="accent" class="pl-0">View on Bscscan</v-btn>
                            </v-col>   
                        </v-row>
                        <v-row dense>
                            <v-col cols="auto" class="text-center">
                                <v-icon small class="mx-3">mdi-key</v-icon>
                            </v-col>
                            <v-col cols="10" class="text-left">
                                <v-btn text v-if="!wallet.unlocked" @click="showPrivateKey(wallet)" x-small color="accent" class="pl-0" :loading="unlocking">Show Private Key</v-btn>
                                <div v-if="wallet.unlocked != null" class="text-break">{{wallet.privateKey}}</div>
                            </v-col>
                        </v-row>
                    </div>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
        <v-dialog v-model="addDialog" persistent max-width="600px">
            <v-card>
                <v-card-title class="title">
                    <v-row>
                        <v-col cols="auto"><v-img src="../images/bridge-token.png" width="36"></v-img></v-col>
                        <v-col cols="10">Add Blockchain Wallet</v-col>
                    </v-row>
                </v-card-title>
                <v-card-text>
                    <p class="text-left">
                        If you have an existing wallet you would like to include in your passport, provide the private key below.  If you want to generate a new wallet, simply leave the field blank.
                    </p>
                    <v-row dense v-if="!neoWallet">
                        <v-col cols="auto"><v-img src="../images/neo-logo.png" width="36"></v-img></v-col>
                        <v-col cols="10">
                        <v-text-field v-model="neoPrivateKey" color="accent" label="Neo Private Key" placeholder=" " type="text" outlined dense></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row dense v-if="!ethWallet">
                        <v-col cols="auto"><v-img src="../images/eth-logo.png" width="36"></v-img></v-col>
                        <v-col cols="10">
                        <v-text-field v-model="ethPrivateKey" color="accent" label="Ethereum Private Key" placeholder=" " type="text" outlined dense></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row dense v-if="!bscWallet">
                        <v-col cols="auto"><v-img src="../images/bsc-logo.png" width="36"></v-img></v-col>
                        <v-col cols="10">
                        <v-text-field v-model="bscPrivateKey" color="accent" label="Binance Smart Chain Private Key" placeholder=" " type="text" outlined dense></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <div>
                        <v-btn text @click="addDialog = false" text-right v-if="!adding">Cancel</v-btn>
                        <v-btn color="accent" @click="adding = true, addWallet()" text-right :loading="adding">Add Wallet</v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <transaction-dialog v-if="transactionDialog" :wallet="transactionWallet" @close="transactionDialog = false; transactionWallet = null" @openUrl="openUrl"></transaction-dialog>
        <token-swap-dialog v-if="tokenSwapDialog" :from="swapFrom" :to="swapTo" @close="tokenSwapDialog = false; swapFrom = null; swapTo = null; "></token-swap-dialog>
        <uniswap-dialog v-if="uniswapDialog" :wallet="wallet" @close="uniswapDialog = false; swapFrom = null; swapTo = null; "></uniswap-dialog>
    </v-container>
</template>

<script>
import TransactionDialog from './PassportWalletsTransactionDialog.vue';
import TokenSwapDialog from './TokenSwapDialog.vue';
import UniswapDialog from './UniswapDialog.vue'; 
export default {
    name: 'passport-wallets',
    components:{
        TransactionDialog,
        TokenSwapDialog,
        UniswapDialog
    },
    methods: {
        addWallet: async function(){
            this.adding = true;
            let success = false;
            let passportContext = await BridgeExtension.getPassportContext();

            if(!this.neoWallet){
                try{
                    await passportContext.passport.addWallet("neo", passportContext.passphrase, this.neoPrivateKey);
                    success = true;
                    this.neoWallet = true;
                }
                catch(err){
                    console.log("Unable to add Neo wallet: " + err.message);
                }
            }
            if(!this.ethWallet){
                try{
                    if(this.ethPrivateKey && !this.ethPrivateKey.startsWith("0x"))
                        this.ethPrivateKey = "0x" + this.ethPrivateKey;

                    await passportContext.passport.addWallet("eth", passportContext.passphrase, this.ethPrivateKey);
                    success = true;
                    this.ethWallet = true;
                }
                catch(err){
                    console.log("Unable to add Ethererum wallet: " + err.message);
                }
            }
            if(!this.bscWallet){
                try{
                    if(this.bscPrivateKey && !this.bscPrivateKey.startsWith("0x"))
                        this.bscPrivateKey = "0x" + this.bscPrivateKey;

                    await passportContext.passport.addWallet("bsc", passportContext.passphrase, this.bscPrivateKey);
                    success = true;
                    this.bscWallet = true;
                }
                catch(err){
                    console.log("Unable to add Binance Smart Chain wallet: " + err.message);
                }
            }

            if(success){
                await BridgeExtension.savePassportToBrowserStorage(passportContext.passport);
            }
            
            this.adding = false;
            this.addDialog = false;
            await this.refreshWallets();
        },
        removeWallet: async function(wallet){
            this.removing = true;

            let hasClaims = false;
            let published = wallet.registered;
            let passportContext = await BridgeExtension.getPassportContext();

            //Check the blockchain for any published claims
            for(let i=0; i<passportContext.claims; i++){
                let claim = await BridgeProtocol.Services.Blockchain.getClaim(wallet.network, passportContext.claims[i].typeId, wallet.address);
                if(claim)
                    hasClaims = true;
            }

            if(hasClaims){
                alert("Unable to remove wallet. Wallet has published claims.  Remove the published claims to remove this passport.");
                this.removing = false;
                return;
            }

            //Check to see if the passport is published
            if(wallet.registered){
                await BridgeProtocol.Services.Blockchain.unpublishPassport(passportContext.passport, wallet);
                let res = await BridgeProtocol.Services.Blockchain.getPassportForAddress(wallet.network, wallet.address);
                if(res && res.length > 0)
                    published = true;
            }

            if(published){
                alert("Unable to remove the wallet.  Error unpublishing passport from wallet.");
                this.removing = false;
                return;
            }

            //Update the wallets collection without this wallet
            let wallets = [];
            for(let i=0; i<passportContext.passport.wallets.length; i++){
                if(passportContext.passport.wallets[i].address != wallet.address)
                    wallets.push(passportContext.passport.wallets[i]);
            }

            //Persist all the wallet changes
            passportContext.passport.wallets = wallets;
            this.wallets = wallets;
            await BridgeExtension.savePassportToBrowserStorage(passportContext.passport);

            if(wallet.network.toLowerCase() === "neo")
                this.neoWallet = false;
            if(wallet.network.toLowerCase() === "eth")
                this.ethWallet = false;
            if(wallet.network.toLowerCase() === "bsc")
                this.bscWallet = false;

            //Hack again?
            this.wallets.push({});
            this.wallets.pop();

            this.removing = false;
            await this.refreshWallets();
        },
        refreshWallets: async function()
        {
            this.refreshing = true;
            let passportContext = await BridgeExtension.getPassportContext();
            if(passportContext){
                this.passportId = passportContext.passport.id;
                let wallets = passportContext.passport.wallets;

                for(let i=0; i<wallets.length; i++){
                    wallets[i].src = "/images/" + wallets[i].network.toLowerCase() + "-logo-white.png";
                    if(wallets[i].network.toLowerCase() === "neo"){
                        this.neoWallet = true;
                        wallets[i].color = "green";
                        wallets[i].networkName = "Neo";
                        wallets[i].gasBalanceLabel = "GAS";
                    }
                    else if(wallets[i].network.toLowerCase() === "eth"){
                        this.ethWallet = true;
                        wallets[i].color = "#6a719f";
                        wallets[i].networkName = "Ethereum";
                        wallets[i].gasBalanceLabel = "ETH";
                    }
                    else if(wallets[i].network.toLowerCase() === "bsc"){
                        this.bscWallet = true;
                        wallets[i].color = "#f3ba2f";
                        wallets[i].networkName = "Binance Smart Chain";
                        wallets[i].gasBalanceLabel = "BSC";
                    }

                    this.wallets = wallets;
                }
            }
            this.refreshing = false;
        },
        walletSelected: async function(wallet){
            if(this.lastSelectedWallet == wallet.address){
                this.lastSelectedWallet = "";
            }
            else{
                this.lastSelectedWallet = wallet.address;
                this.refreshWallet(wallet);
            }
        },
        showPrivateKey: async function(wallet){
            this.unlocking = true;
            let passportContext = await BridgeExtension.getPassportContext();
            await wallet.unlock(passportContext.passphrase);
            this.unlocking = false;          
        },
        showTransactions: function(wallet){
            this.transactionWallet = wallet;
            this.transactionDialog = true;
        },
        refreshWallet: async function(wallet){
            wallet.unlocked = null;
            wallet.loaded = false;
            wallet.registered = false;
            wallet.brdgBalance = "0";
            wallet.gasBalance = "0"
            wallet.nativeBalance = "0";

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.wallets.push({});
            this.wallets.pop();

            try{
                let balances = await BridgeExtension.getWalletBalances(wallet);
                wallet.brdgBalance = balances.brdg;
                wallet.gasBalance = balances.gas;
                wallet.nativeBalance = balances.native;

                let res = await BridgeProtocol.Services.Blockchain.getPassportForAddress(wallet.network, wallet.address);
                if(res && res.length > 0)
                    wallet.registered = true;
            }
            catch(err){
                alert(err.message);
            }
            wallet.loaded = true;

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.wallets.push({});
            this.wallets.pop();
        },
        tokenSwap: async function(network){
            network = network.toLowerCase();
            let passportContext = await BridgeExtension.getPassportContext();
            if(network === "neo"){
                this.swapFrom = passportContext.passport.getWalletForNetwork("neo");
                this.swapTo = passportContext.passport.getWalletForNetwork("eth");
            }
            else{
                this.swapFrom = passportContext.passport.getWalletForNetwork("eth");
                this.swapTo = passportContext.passport.getWalletForNetwork("neo");
            }

            if(!this.swapFrom || !this.swapTo){
                alert("You must have both a Neo and Ethereum wallet in your passport to swap tokens.");
                return;
            }

            this.tokenSwapDialog = true;
            //HACK: there has to be a better way to force the refresh
            this.wallets.push({});
            this.wallets.pop();
        },
        buyUniswap: async function(wallet){
            this.uniswapDialog = true;
            this.wallets.push({});
            this.wallets.pop();
        },
        openUrl: function(url){
            this.$emit('openUrl', url);
        }
    },
    data: function() {
        return {
            passportId: "",
            lastSelectedWallet: "",
            unlocking: false,
            neoWallet: null,
            ethWallet: null,
            bscWallet: null,
            neoPrivateKey: null,
            ethPrivateKey: null,
            bscPrivateKey: null,
            refreshing: true,
            addDialog: false,
            adding: false,
            removing: false,
            transactionDialog: false,
            transactionWallet: null,
            wallets: [],
            swapFrom: null,
            swapTo: null,
            uniswapDialog: false
        }
    },
    created: async function(){
        await this.refreshWallets();
    }
};
</script>