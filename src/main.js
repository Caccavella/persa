import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
Vue.use(Vuex)

import store from './store';
export const EventService = new Vue();

new Vue({
  router,
  store,
  components: {},
  render: h => h(App),
}).$mount('#app')
