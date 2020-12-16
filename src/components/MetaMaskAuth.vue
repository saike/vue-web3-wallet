<template>
  
  <v-flex>

    <v-flex class="subtitle-1">
      METAMASK AUTH
    </v-flex>

    <v-divider class="mb-3"></v-divider>
    <v-flex v-if="this.accounts.length === 0">
      <v-flex>Please enable DAPPS</v-flex>
      <v-btn @click="requestDapps">Enable</v-btn>
    </v-flex>

    <v-flex v-else>

       <v-flex class="subtitle-2">Connected accounts:</v-flex> 

       <v-list>
         <v-list-item v-for="address in accounts" :key="address">
           <v-list-item-content>
             {{ address }}
           </v-list-item-content>
           <v-list-item-action color="primary">
             <v-btn @click="authorize(address)">Authorize</v-btn>
           </v-list-item-action>
         </v-list-item>
       </v-list>    

    </v-flex>


  </v-flex>

</template>

<script>
export default {
  data(){
    return {
      accounts: []
    };
  },
  methods: {
    async getAccounts(){

      try {
        
        this.accounts = await this.$web3.eth.getAccounts();
        console.log(this.accounts);
            
      }
      catch (error) {

        console.log(error);
        
      }

    },
    async requestDapps(){

      try {
        
        await this.$web3.currentProvider.enable();

        this.getAccounts();

      }
      catch (error) {

        console.log('rejected');
        
      }    

    },
    authorize(address){

      this.$emit('authorize', address);

    }
  },
  mounted() {
    // window.ethereum.enable();
    this.getAccounts();
    console.log(this.$web3.enabled);
    // window.web3.personal.sign(window.web3.fromUtf8("Hello from Toptal!"), window.web3.eth.coinbase, console.log);
  }
}
</script>