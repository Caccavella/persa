import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import '../src/assets/css/theme/index.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFacebook, faTwitterSquare, faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faFacebook, faTwitterSquare, faLinkedin, faInstagram)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(ElementUI);

Vue.config.productionTip = false
Vue.use(Vuex)

import store from './store';
export const EventService = new Vue();

new Vue({
  router,
  store,
  components: {},
  render: h => h(App)
}).$mount('#app')
