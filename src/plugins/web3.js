import Web3 from 'web3';

let web3_instance = new Web3(window.web3.currentProvider);

export default {
  install(Vue){

    Vue.prototype.$web3 = web3_instance;

  }
}