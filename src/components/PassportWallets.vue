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
            class="mb-2"
            >
                <v-expansion-panel-header class="left-border-color-primary">
                    <v-row>
                        <v-col cols="auto"><v-img :src="wallet.src" height="40" width="40"></v-img></v-col>
                        <v-col cols="auto">
                            <h3 class="mb-2" v-text="wallet.networkName"></h3>
                            <div v-text="wallet.address"></div>
                        </v-col>
                    <v-row>
                </v-expansion-panel-header>
                <v-expansion-panel-content class="left-border-color-primary">
                    <div class="text-center" v-if="!wallet.loaded">
                        <v-progress-circular
                            indeterminate
                            color="primary"
                        ></v-progress-circular>
                    </div>
                    <div v-if="wallet.loaded">
                        <v-divider></v-divider>
                        <div class="d-flex justify-center">
                            <div class="justify-center text-center ml-2 mr-2">
                                <div>{{wallet.gasBalanceLabel}}</div>
                                <div width="40">
                                    <v-img :src="'/images/' + wallet.network.toLowerCase() + '-logo.png'" height="30" contain></v-img>
                                </div>
                                <div>{{wallet.gasBalance}}</div>
                            </div>
                            <div class="justify-center text-center ml-2 mr-2">
                                <div>BRDG</div>
                                <div width="40">
                                    <v-img :src="'/images/bridge-token.png'" height="30" contain></v-img>
                                </div>
                                <div>{{wallet.brdgBalance}}</div>
                            </div>
                        </div>
                        <v-row>
                            <v-col cols="3">Passport Registered</v-col>
                            <v-col cols="auto">
                                <span v-if="wallet.registered">Registered on Blockchain</span>
                                <span v-if="!wallet.registered">Not Registered</span>
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