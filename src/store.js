import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    signedIn: false,
    loggedUser: {},
    priorUser: {},
    newResult: false
  },
  mutations: {
    updateSignInStatus(state, status) {
      state.signedIn = status;
    },
    updateLoggedUser(state, user) {
      // console.log('thisuser', user);
      state.loggedUser = user;
    },
    updatePriorUser(state, user) {
      // console.log('prior', user);
      state.priorUser = user;
    },
    updateNewResultFlag(state, status) {
      state.newResult = status;
    },
  }
})