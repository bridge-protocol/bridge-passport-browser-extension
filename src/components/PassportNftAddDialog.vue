<template>
    <v-container fill-height align-start text-center class="mx-0 my-0 px-0 py-0" ref="mainContainer">
        ADD
    </v-container>
</template>

<script>
export default {
    name: 'passport-nft-add-dialog',
    components: {
     
    },
    data: function() {
        return {
            loadStatus: "Please Wait",
            mainContainerHeight: 985,
            lastSelected: ""
        }
    },
    methods: {
        init: async function(){

        }
    },
    mounted: async function()
    {
        this.$nextTick(async function () {
            await this.init();
        });
    }
};
</script>