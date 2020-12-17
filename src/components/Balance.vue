<template>
  
  <v-flex>

    <v-flex class="subtitle-2">Balances</v-flex>

    <v-flex>

      <v-list>
        <!-- <v-list-item>
          <v-list-item-content>ETH</v-list-item-content>
          <v-list-item-content>{{ balance }}</v-list-item-content>
          <v-list-item-action>
            <v-btn small @click="$emit('select', null)">Transactions</v-btn>
          </v-list-item-action>
        </v-list-item> -->
        <v-list-item v-for="coin in coins" :key="coin.contract">
          <v-list-item-content>{{ coin.name }}</v-list-item-content>
          <v-list-item-content>{{ coin.balance }}</v-list-item-content>
          <v-list-item-action>
            <v-btn small @click="$emit('select', coin)">Transactions</v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-flex>
        <v-btn block color="primary" @click="createCoin">Add coin</v-btn>
      </v-flex>

    </v-flex>

    <v-dialog :value="coin" max-width="500px">
      <v-card>
        <v-card-title>
          Add coin
        </v-card-title>
        <v-card-text class="pt-3">
          <v-form>
            <v-alert color="error" outlined v-if="error">{{ error }}</v-alert>
            <v-text-field placeholder="Enter contract address" solo flat outlined hide-details v-model="coin.contract"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="addCoin" color="success" block>Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-flex>

</template>

<script>
export default {
  props: [ 'address' ],
  data(){
    return {
      // balance: null,
      coins: [
        {
          name: 'Etherium',
          balance: 0,
          contract: null
        }
      ],
      coin: false,
      error: false
    }
  },
  watch: {
    address: {
      handler(){

        this.getBalance();

      },
      immediate: true
    }
  },
  methods: {

    async getBalance(){

      if(!this.address) return;

      try {
        
        var balance = await this.$web3.eth.getBalance(this.address); //Will give value in.
        console.log(balance);
        this.coins[0].balance = this.$web3.utils.fromWei(balance);
        // balance = this.$web3.utils.toWei(balance);

      }
      catch (error) {

        console.log(error);
        
      }

    },
    createCoin(){

      this.coin = { contract: '' };

    },
    async addCoin(){

      try {

         this.error = false;
       
        let tokenAddress = this.coin.contract;
        let walletAddress = this.address;

        // The minimum ABI to get ERC20 Token balance
        let minABI = [
          // balanceOf
          {
            "constant":true,
            "inputs":[{"name":"_owner","type":"address"}],
            "name":"balanceOf",
            "outputs":[{"name":"balance","type":"uint256"}],
            "type":"function"
          },         
          {
            "constant":true,
            "inputs":[],
            "name":"name",
            "outputs":[{"name":"name","type":"string"}],
            "type":"function"
          },
          // decimals
          {
            "constant":true,
            "inputs":[],
            "name":"decimals",
            "outputs":[{"name":"","type":"uint8"}],
            "type":"function"
          }
        ];

        let contract = await (new this.$web3.eth.Contract(minABI, tokenAddress));

        console.log(contract);

        let balance = await contract.methods.balanceOf(walletAddress).call();

        let decimals = await contract.methods.decimals().call();

        let name = await contract.methods.name().call();


        console.log(name, balance,decimals);

        balance = balance/(10**decimals);


        this.coins.push({ balance, contract: tokenAddress, name });

        this.coin = false;

      }
      catch (error) {

        this.error = error;
        console.log(error);
        
      }

    }

  }
}
</script>