<template>

<v-container fill-height align-start>
    <v-container class="mt-0 pt-0 text-left">
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
        <v-expansion-panels>
            <v-expansion-panel
            v-for="(wallet,i) in wallets"
            :key="wallet.address"
            @click="walletSelected(wallet)"
            class="mb-2"
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
                        <v-subheader class="pl-0 ml-0">Balances</v-subheader>
                        <v-divider class="mb-2"></v-divider>
                        <v-row dense>
                            <v-col cols="auto" class="text-left">
                                <v-img :src="'/images/' + wallet.network.toLowerCase() + '-logo.png'" height="20" contain></v-img>
                            </v-col>
                            <v-col cols="auto" class="text-left">{{wallet.gasBalance}} {{wallet.gasBalanceLabel}}</v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="auto" class="text-left">
                                <v-img :src="'/images/bridge-token.png'" height="20" contain></v-img>
                            </v-col>
                            <v-col cols="auto" class="text-left align-end">{{wallet.brdgBalance}} BRDG</v-col>
                        </v-row>

                        <v-subheader class="pl-0 ml-0">Address</v-subheader>
                        <v-divider class="mb-2"></v-divider>
                        <v-row dense>
                            <v-col cols="auto" class="text-left">
                                <v-img :src="'/images/' + wallet.network.toLowerCase() + '-logo.png'" height="20" contain></v-img>
                            </v-col>
                            <v-col cols="auto" class="text-left">{{wallet.address}} 
                                <v-chip
                                v-if="wallet.registered"
                                class="ma-2"
                                label
                                x-small
                                :color="secondaryv"
                                >
                                    Registered
                                </v-chip>
                                <v-btn v-if="!wallet.registered" @click="removeWallet(wallet)" x-small color="secondary" class="ml-2" :loading="removing">Remove</v-btn></v-col>
                        </v-row>

                        <v-subheader class="pl-0 ml-0">Private Key</v-subheader>
                        <v-divider class="mb-2"></v-divider>
                        <v-row dense>
                            <v-col cols="auto" class="text-center">
                                <v-icon small class="mx-3">mdi-key</v-icon>
                            </v-col>
                            <v-col cols="10" class="text-left">
                                <v-btn v-if="!wallet.unlocked" @click="showPrivateKey(wallet)" x-small color="secondary" :loading="unlocking">Show Private Key</v-btn>
                                <div v-if="wallet.unlocked != null" class="text-break">{{wallet.privateKey}}</div>
                            </v-col>
                        </v-row>
                    </div>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
        <v-container fill-height align-start class="px-0 py-0">
            <v-expansion-panels v-if="wallets.length < 2" flat class="align-start mx-0 my-0">
                <v-expansion-panel key="add-wallet">
                    <v-expansion-panel-header>
                        Add Wallet
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <p class="text-left">
                            If you have an existing wallet you would like to include in your passport, provide the private key below.  If you want to generate a new wallet, simply leave the field blank.
                        </p>
                        <v-row dense v-if="!neoWallet">
                            <v-col cols="auto"><v-img src="../images/neo-logo.png" width="36"></v-img></v-col>
                            <v-col cols="10">
                            <v-text-field v-model="neoPrivateKey" color="secondary" label="NEO Private Key" placeholder=" " type="text" outlined dense></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row dense v-if="!ethWallet">
                            <v-col cols="auto"><v-img src="../images/eth-logo.png" width="36"></v-img></v-col>
                            <v-col cols="10">
                            <v-text-field v-model="ethPrivateKey" color="secondary" label="Ethereum Private Key" placeholder=" " type="text" outlined dense></v-text-field>
                            </v-col>
                        </v-row>
                        <v-btn text @click="addWallet();" class="text-right" :loading="adding">Add Wallet</v-btn>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-container>
    </v-container>
</v-container>

</template>

<script>
export default {
    name: 'passport-wallets',
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
                    console.log("Unable to add NEO wallet: " + err.message);
                }
            }
            if(!this.ethWallet){
                try{
                    await passportContext.passport.addWallet("eth", passportContext.passphrase, this.ethPrivateKey);
                    success = true;
                    this.ethWallet = true;
                }
                catch(err){
                    console.log("Unable to add Ethererum wallet: " + err.message);
                }
            }

            if(success){
                await BridgeExtension.savePassportToBrowserStorage(passportContext.passport);
            }
            
            this.adding = false;
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

            //Hack again?
            this.wallets.push({});
            this.wallets.pop();

            this.removing = false;
            await this.refreshWallets();
        },
        refreshWallets: async function()
        {
            let passportContext = await BridgeExtension.getPassportContext();
            if(passportContext){
                this.passportId = passportContext.passport.id;
                let wallets = passportContext.passport.wallets;

                for(let i=0; i<wallets.length; i++){
                    wallets[i].src = "/images/" + wallets[i].network.toLowerCase() + "-logo-white.png";
                    if(wallets[i].network.toLowerCase() === "neo"){
                        this.neoWallet = true;
                        wallets[i].color = "green";
                        wallets[i].networkName = "NEO";
                        wallets[i].gasBalanceLabel = "GAS";
                    }
                    else if(wallets[i].network.toLowerCase() === "eth"){
                        this.ethWallet = true;
                        wallets[i].color = "#6a719f";
                        wallets[i].networkName = "Ethereum";
                        wallets[i].gasBalanceLabel = "ETH";
                    }

                    this.wallets = wallets;
                }
            }
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
        refreshWallet: async function(wallet){
            wallet.unlocked = null;
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
            unlocking: false,
            neoWallet: null,
            ethWallet: null,
            neoPrivateKey: null,
            ethPrivateKey: null,
            adding: false,
            removing: false,
            wallets: []
        }
    },
    created: async function(){
        await this.refreshWallets();
    }
};
</script>