<template>
    <div>PASSPORT WALLETS: {{ passportId }}</div>
</template>

<script>
export default {
    name: 'passport-wallets',
    props: ['passport'],
    watch: { 
        // watch passport for changes so we know to get the new context
        passport: async function(newVal,oldVal) { 
          console.log('Prop changed: ', newVal, ' | was: ', oldVal);
          let passportContext = await BridgeExtension.getPassportContext();
          if(passportContext.passport){
              this.passportId = passportContext.passport.id;
          }
        }
    },
    data: function() {
        return {
            passportId: ""
        }
    },
    created: async function(){
        let passportContext = await BridgeExtension.getPassportContext();
        if(passportContext.passport)
            this.passportId = passportContext.passport.id;
    }
};
</script>