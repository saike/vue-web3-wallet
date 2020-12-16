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

                <Balance :address="address"/>

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

export default {
  name: "App",

  components: {
    MetaMaskAuth,
    Balance
  },

  data: () => ({
    address: null
  }),
};
</script>
