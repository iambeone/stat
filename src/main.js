import Vue from 'vue'
import App from './App.vue'
const dotenv = require('dotenv');
dotenv.config();
console.log(process.env)
Vue.config.productionTip = false
new Vue({
  render: h => h(App)
}).$mount('#app')
