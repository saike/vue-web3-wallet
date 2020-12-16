import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import web3 from './plugins/web3';

Vue.config.productionTip = false

Vue.use(web3);

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
