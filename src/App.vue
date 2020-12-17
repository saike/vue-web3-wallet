<template>
  <v-app>
    <v-main>
      <v-container fill-height fluid>
        <v-row align="center" justify="center">
          <v-col cols="auto">
            <v-card>
              <v-card-text v-if="!address">
                <MetaMaskAuth @authorize="address = $event"/>
              </v-card-text>
              <v-card-text v-else>

                <v-flex class="subtitle-1 mt-3">Address: {{ address }}</v-flex>

                <v-divider class="my-3"></v-divider>

                <Balance :address="address" @select="token = $event"/>

                <v-divider class="my-3"></v-divider>

                <Transactions v-if="token" :token="token" :address="address"/>

              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import MetaMaskAuth from "./components/MetaMaskAuth";
import Balance from "./components/Balance";
import Transactions from "./components/Transactions";

export default {
  name: "App",

  components: {
    MetaMaskAuth,
    Balance,
    Transactions
  },

  data: () => ({
    address: null,
    token: null
  }),
};
</script>
