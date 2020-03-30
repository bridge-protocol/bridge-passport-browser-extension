<template>

<v-container fill-height align-start>
    <v-container class="mt-0 pt-0">
        <h3 inset><v-icon class="mr-2">mdi-wallet</v-icon> My Blockchain Wallets</h3>
    </v-container>
    <v-container fill-height align-start>
        <v-alert
            border="left"
            colored-border
            type="info"
            elevation="2"
            class="mt-2 text-left"
            v-if="wallets.length == 0"
            >
            No blockchain wallets found.  Add or import a wallet below to get started.
        </v-alert>
        <v-expansion-panels >
            <v-expansion-panel
            v-for="(wallet,i) in wallets"
            :key="wallet.network"
            @click="walletSelected(wallet)"
            >
                <v-expansion-panel-header class="mb-2" :color="wallet.color">
                    <v-row>
                        <v-col cols="auto"><v-img :src="wallet.src" height="40" width="40"></v-img></v-col>
                        <v-col cols="auto">
                            <h3 class="mb-2" v-text="wallet.networkName"></h3>
                            <div v-text="wallet.address"></div>
                        </v-col>
                    <v-row>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <div class="text-center pt-2" v-if="!wallet.loaded">
                        <v-progress-circular
                            indeterminate
                            color="primary"
                        ></v-progress-circular>
                    </div>
                    <div v-if="wallet.loaded">
                        <v-row>
                            <v-col cols="2">Registered</v-col>
                            <v-col cols="auto">
                                <span v-if="wallet.registered">Registered on Blockchain</span>
                                <v-btn v-if="!wallet.registered" x-small color="primary">Register</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="2">Balances</v-col>
                            <v-col cols="10">
                                <v-row v-if="wallet.network.toLowerCase() == 'neo'">
                                    <v-col cols="10">
                                        <v-img :src="'/images/bridge-token.png'" height="20" width="20"></v-img>
                                        <span>BRDG {{wallet.brdgBalance}}</span>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="10">
                                        <span><v-img :src="'/images/' + wallet.network.toLowerCase() + '-logo.png'" height="22" width="22"></v-img></span> <span v-text="wallet.gasBalanceLabel"></span> <span v-text="wallet.gasBalance"></span>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </div>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-container>
</v-container>

</template>

<script>
export default {
    name: 'passport-wallets',
    methods: {
        refreshWallets: async function()
        {
            let passportContext = await BridgeExtension.getPassportContext();
            if(passportContext){
                
                this.passportId = passportContext.passport.id;
                let wallets = passportContext.passport.wallets;

                for(let i=0; i<wallets.length; i++){
                    wallets[i].src = "/images/" + wallets[i].network.toLowerCase() + "-logo-white.png";

                    if(wallets[i].network.toLowerCase() === "neo"){
                        wallets[i].color = "green";
                        wallets[i].networkName = "NEO";
                        wallets[i].gasBalanceLabel = "GAS";
                    }
                    else if(wallets[i].network.toLowerCase() === "eth"){
                        wallets[i].color = "#6a719f";
                        wallets[i].networkName = "Ethereum";
                        wallets[i].gasBalanceLabel = "ETH";
                    }

                    this.wallets = wallets;
                }
            }
        },
        walletSelected: async function(wallet){
            if(this.lastSelectedWallet.toLowerCase() == wallet.network.toLowerCase()){
                this.lastSelectedWallet = "";
            }
            else{
                this.lastSelectedWallet = wallet.network;
                this.refreshWallet(wallet);
            }
        },
        refreshWallet: async function(wallet){
            wallet.loaded = false;
            wallet.registered = false;
            wallet.brdgBalance = "0";
            wallet.gasBalance = "0"

            //HACK: there has to be a better way to force the refresh, not sure why the array isn't being watched correctly
            this.wallets.push({});
            this.wallets.pop();

            try{
                let balances = await BridgeProtocol.Services.Blockchain.getBalances(wallet.network, wallet.address);
                let gas = 0;
                let brdg = 0;
                if(balances){
                    for(let i=0; i<balances.length; i++){
                        if(balances[i].asset == "GAS"){
                            gas = balances[i].balance;
                        }
                        else if(balances[i].asset == "ETH"){
                            gas = balances[i].balance;
                        }

                        if(balances[i].asset == "BRDG"){
                            brdg = balances[i].balance;
                        }
                    }
                }
                wallet.brdgBalance = brdg;
                wallet.gasBalance = gas;

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
        }   
    },
    data: function() {
        return {
            passportId: "",
            lastSelectedWallet: "",
            wallets: []
        }
    },
    created: async function(){
        await this.refreshWallets();
    }
};
</script>