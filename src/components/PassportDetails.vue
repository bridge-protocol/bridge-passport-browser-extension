<template>
    <div>Passport Id: {{passportId}}</div>
</template>

<script>
export default {
    name: 'passport-details',
    data: function() {
        return {
            passportId: ""
        }
    },
    created: async function(){
        let passportContext = await BridgeExtension.getPassportContext();
        this.passportId = passportContext.passport.id;
    }
};
</script>