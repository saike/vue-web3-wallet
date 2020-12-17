<template>
  <v-flex>
    <v-flex class="subtitle-1">{{ token.name }} transactions</v-flex>

    <v-flex>
      <v-simple-table bordered>
        <tr>
          <th class="text-left pa-2">Date</th>
          <th class="text-left pa-2">Hash</th>
          <!-- <th class="text-left pa-2">Contract Address</th> -->
          <th class="text-left pa-2">From</th>
          <th class="text-left pa-2">To</th>
          <th class="text-left pa-2">Value</th>
          <th class="text-left pa-2">Status</th>
          <th class="text-left pa-2">Link</th>
        </tr>
        <tr v-for="tx in transactions" :key="tx.hash">
          <td class="pa-2">
            {{ new Date(parseInt(tx.timeStamp) * 1000).toLocaleString() }}
          </td>
          <td class="pa-2">
            {{ tx.hash }}
          </td>
          <!-- <td class="pa-2">
            {{ tx.contractAddress }}
          </td> -->
          <td class="pa-2">
            {{ tx.from }}
          </td>
          <td class="pa-2">
            {{ tx.to }}
          </td>
          <td class="pa-2">
            {{ $web3.utils.fromWei(tx.value) }}
          </td>
          <td class="pa-2">
            <v-flex v-if="tx.status > -1">
              <span v-if="tx.status === 0">Pending ({{ tx.confirmations }}/4)</span>
              <span v-else>Success</span>
            </v-flex>
            <v-flex v-else class="error--text"> Fail </v-flex>
          </td>
          <td>
            <v-btn
              link
              target="_blank"
              :href="`https://rinkeby.etherscan.io/tx/${tx.hash}`"
              >Etherscan</v-btn
            >
          </td>
        </tr>
      </v-simple-table>
      <v-flex class="mt-3">
        <v-btn @click="createTransaction">Send {{ token.name }}</v-btn>
      </v-flex>
    </v-flex>

    <v-dialog :value="tx" max-width="500px">
      <v-card>
        <v-card-title>New transaction</v-card-title>
        <v-card-text>
          <v-form>
            <v-alert color="error" outlined v-if="error">{{ error }}</v-alert>
            <v-text-field
              class="mt-3"
              placeholder="Enter receipt address"
              solo
              flat
              outlined
              hide-details
              v-model="tx.to"
            ></v-text-field>
            <v-text-field
              class="mt-3"
              placeholder="Amount"
              solo
              flat
              outlined
              hide-details
              v-model="tx.value"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit" color="success" block @click="requestTransaction"
            >Send</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
export default {
  props: ["token", "address"],
  data() {
    return {
      transactions: [],
      tx: false,
      error: false,
      tx_checker: false,
      confirm_subscription: false
    };
  },
  watch: {
    token: {
      handler() {
        // this.getTransactions();
      },
      immediate: true,
    },
  },
  methods: {
    // async getTransactions() {
    //   console.log("get transactions");

    //   try {
    //     let tx_data = await api.account.txlist(this.address);

    //     this.transactions = tx_data.result;
    //     console.log(this.transactions);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
    createTransaction() {
      this.tx = {
        to: "",
        value: 0,
      };
    },
    async requestTransaction() {
      if (!this.token.contract) {
        try {
          let tx_hash = await this.$web3.currentProvider.request({
            method: "eth_sendTransaction",
            params: [
              {
                from: this.address,
                to: this.tx.to,
                value: this.$web3.utils.toHex(
                  this.$web3.utils.toWei(this.tx.value)
                ),
                // gasPrice: this.$web3.utils.toHex(2 * 1e9),
                // gas: this.$web3.utils.toHex(210000),
              },
            ],
          });

          console.log(tx_hash);

          this.subscribeTransaction(tx_hash);

          this.tx = false;

          // this.getTransactions();
        } catch (error) {
          this.error = error;
        }
      } else {
        try {
          let abi = [
            // balanceOf
            {
              constant: false,
              inputs: [
                {
                  name: "_to",
                  type: "address",
                },
                {
                  name: "_value",
                  type: "uint256",
                },
              ],
              name: "transfer",
              outputs: [
                {
                  name: "",
                  type: "bool",
                },
              ],
              payable: false,
              stateMutability: "nonpayable",
              type: "function",
            },
          ];

          let contract = new this.$web3.eth.Contract(abi, this.token.contract, {
            from: this.address,
          });

          let rawTransaction = {
            from: this.address,
            // gasPrice: this.$web3.utils.toHex(2 * 1e9),
            // gasLimit: this.$web3.utils.toHex(210000),
            to: this.token.contract,
            value: "0x0",
            data: contract.methods
              .transfer(this.tx.to, this.$web3.utils.toWei(this.tx.value))
              .encodeABI(),
          };

          console.log(contract);

          let tx_hash = await this.$web3.currentProvider.request({
            method: "eth_sendTransaction",
            params: [rawTransaction],
          });

          console.log(tx_hash);

          this.subscribeTransaction(tx_hash);

          this.tx = false;

          // this.getTransactions();
        } catch (error) {
          this.error = error;
        }
      }
    },
    subscribeTransaction(new_tx_hash) {
      // Instantiate subscription object
      const subscription = this.$web3.eth.subscribe("newBlockHeaders");

      // Subscribe to pending transactions
      subscription
        .subscribe((error) => {
          if (error) console.log(error);
        })
        .on("data", async (headers) => {
          try {
            

            let block = await this.$web3.eth.getBlock(headers.hash, true);

            let tx = block.transactions.find((tx) => tx.hash === new_tx_hash);

            if (!tx) return;

            tx.timeStamp = block.timestamp;
            tx.status = 0;
            tx.confirmations = 0;

            let exist = this.transactions.find((tx) => tx.hash === new_tx_hash);

            if(exist) return;

            this.transactions.push(tx);

            subscription.unsubscribe();

            console.log(this.transactions);
          } catch (error) {
            this.error = error;
          }
        });
    },
    subscribeConfirmations(){

      this.confirm_subscription = this.$web3.eth.subscribe("newBlockHeaders");

      // Subscribe to pending transactions
      this.confirm_subscription
        .subscribe((error) => {
          if (error) console.log(error);
        })
        .on("data", async (headers) => {

          let block = await this.$web3.eth.getBlock(headers.hash, true);

          this.transactions.forEach(async (tx) => {
            try {

              let receipt = await this.$web3.eth.getTransactionReceipt(
                tx.hash
              );

              if (receipt.status) {
                let confirmations = block.number - tx.blockNumber;
                console.log(confirmations);
                tx.confirmations = confirmations;
                
                if (confirmations >= 4) {
                  tx.status = 1;
                }
              } else {
                tx.status = -1;
              }
            } catch (error) {
              this.error = error;
            }  
          })
          
        });  

    }
  },
  mounted() {
    // this.tx_checker = setInterval(() => {
    //   this.getTransactions();
    // }, 5000);
    console.log(this.$web3.currentProvider);
    this.subscribeConfirmations();
  },
  beforeDestroy() {

    this.confirm_subscription.unsubscribe();
    // clearInterval(this.tx_checker);
    // this.pendingTransactionsSubscription.unsubscribe();
  },
};
</script>